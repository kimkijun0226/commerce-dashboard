"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { getEligibleOrderIdsForProduct } from "@/lib/commerce/reviewWriteOrder";
import type { Database } from "@/types/supabase";

export type ReviewActionErrorCode =
  | "AUTH_REQUIRED"
  | "NOT_FOUND"
  | "FORBIDDEN"
  | "VALIDATION"
  | "DUPLICATE_REVIEW"
  | "PURCHASE_REQUIRED"
  | "ALL_ORDERS_REVIEWED";

function throwActionError(code: ReviewActionErrorCode, message: string): never {
  throw new Error(`${code}:${message}`);
}

export type ReviewWriteEligibility =
  | { canCreate: true; pendingCount: number }
  | {
      canCreate: false;
      reason: "login" | "no_purchase" | "all_orders_reviewed";
      pendingCount: number;
    };

/** 아직 리뷰가 없는 가장 이른 결제 완료 주문에 대한 order_id */
async function findNextReviewOrderId(
  supabase: SupabaseClient<Database>,
  userId: string,
  productId: string,
): Promise<string> {
  const eligibleIds = await getEligibleOrderIdsForProduct(supabase, userId, productId);
  if (eligibleIds.length === 0) {
    throwActionError(
      "PURCHASE_REQUIRED",
      "결제가 완료된 주문에서 구매한 상품만 리뷰를 작성할 수 있습니다.",
    );
  }

  const { data: existing, error: existingErr } = await supabase
    .from("reviews")
    .select("order_id")
    .eq("user_id", userId)
    .eq("product_id", productId);

  if (existingErr) throw new Error(existingErr.message);
  const reviewed = new Set((existing ?? []).map((r) => r.order_id));

  for (const oid of eligibleIds) {
    if (!reviewed.has(oid)) return oid;
  }

  throwActionError(
    "ALL_ORDERS_REVIEWED",
    "이 상품에 대해 남길 수 있는 주문별 리뷰를 모두 작성하셨습니다. 새로 주문하시면 다시 작성할 수 있어요.",
  );
}

async function assertOrderEligibleForProductReview(
  supabase: SupabaseClient<Database>,
  userId: string,
  productId: string,
  orderId: string,
): Promise<void> {
  const { data: order, error: orderErr } = await supabase
    .from("orders")
    .select("id, user_id, status, payment_status")
    .eq("id", orderId)
    .maybeSingle();

  if (orderErr) throw new Error(orderErr.message);
  if (!order || order.user_id !== userId) {
    throwActionError("FORBIDDEN", "본인의 주문에 대해서만 리뷰를 작성할 수 있습니다.");
  }
  if (order.status !== "paid" || order.payment_status !== "success") {
    throwActionError(
      "PURCHASE_REQUIRED",
      "결제가 완료된 주문에서 구매한 상품만 리뷰를 작성할 수 있습니다.",
    );
  }

  const { data: line, error: lineErr } = await supabase
    .from("order_items")
    .select("id")
    .eq("order_id", orderId)
    .eq("product_id", productId)
    .limit(1)
    .maybeSingle();

  if (lineErr) throw new Error(lineErr.message);
  if (!line) {
    throwActionError("VALIDATION", "해당 주문에 포함된 상품이 아닙니다.");
  }

  const { data: dup, error: dupErr } = await supabase
    .from("reviews")
    .select("id")
    .eq("order_id", orderId)
    .eq("product_id", productId)
    .maybeSingle();

  if (dupErr) throw new Error(dupErr.message);
  if (dup) {
    throwActionError("DUPLICATE_REVIEW", "이 주문에 대한 이 상품 리뷰는 이미 등록되어 있습니다.");
  }
}

async function resolveReviewOrderId(
  supabase: SupabaseClient<Database>,
  userId: string,
  productId: string,
  preferredOrderId?: string | null,
): Promise<string> {
  const pref = preferredOrderId?.trim();
  if (pref) {
    await assertOrderEligibleForProductReview(supabase, userId, productId, pref);
    return pref;
  }
  return findNextReviewOrderId(supabase, userId, productId);
}

/** PDP 등에서 SSR로 리뷰 작성 가능 여부·남은 주문별 슬롯 수 조회 */
export async function getReviewWriteEligibility(
  productId: string,
): Promise<ReviewWriteEligibility> {
  const pid = parseId(productId);
  if (!pid) {
    return { canCreate: false, reason: "no_purchase", pendingCount: 0 };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { canCreate: false, reason: "login", pendingCount: 0 };
  }

  try {
    const eligibleIds = await getEligibleOrderIdsForProduct(
      supabase,
      user.id,
      pid,
    );
    if (eligibleIds.length === 0) {
      return { canCreate: false, reason: "no_purchase", pendingCount: 0 };
    }

    const { data: existing, error: existingErr } = await supabase
      .from("reviews")
      .select("order_id")
      .eq("user_id", user.id)
      .eq("product_id", pid);

    if (existingErr) {
      console.error("[getReviewWriteEligibility]", existingErr);
      return { canCreate: false, reason: "no_purchase", pendingCount: 0 };
    }

    const reviewed = new Set((existing ?? []).map((r) => r.order_id));
    const pendingCount = eligibleIds.filter((id) => !reviewed.has(id)).length;

    if (pendingCount === 0) {
      return {
        canCreate: false,
        reason: "all_orders_reviewed",
        pendingCount: 0,
      };
    }

    return { canCreate: true, pendingCount };
  } catch (e) {
    console.error("[getReviewWriteEligibility]", e);
    return { canCreate: false, reason: "no_purchase", pendingCount: 0 };
  }
}

function parseId(value: unknown): string {
  return String(value ?? "").trim();
}

function normalizeRating(value: unknown): number {
  const stepped = Math.round(Number(value) * 2) / 2;
  const rating = Math.max(1, Math.min(5, stepped));
  return rating;
}

function validateReviewInput(
  rating: number,
  content: string,
): { rating: number; content: string } {
  const normalized = normalizeRating(rating);
  const body = String(content ?? "").trim();

  if (normalized < 1 || normalized > 5) {
    throwActionError("VALIDATION", "별점은 1~5점이어야 합니다.");
  }
  if (Math.round(normalized * 2) !== normalized * 2) {
    throwActionError("VALIDATION", "별점은 0.5점 단위로만 선택할 수 있습니다.");
  }
  if (body.length < 10) {
    throwActionError("VALIDATION", "리뷰 내용은 최소 10자 이상 입력해 주세요.");
  }
  return { rating: normalized, content: body };
}

export type CreateReviewInput = {
  productId: string;
  rating: number;
  content: string;
  /** 지정 시 해당 주문·상품에만 리뷰 연결 (주문 상세·마이 리뷰에서 전달) */
  orderId?: string | null;
};

export async function createReview(input: CreateReviewInput): Promise<void> {
  const productId = parseId(input.productId);
  const { rating, content } = validateReviewInput(input.rating, input.content);

  if (!productId) throwActionError("VALIDATION", "상품 정보가 올바르지 않습니다.");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect(`/login?next=/products/${encodeURIComponent(productId)}`);
  }

  const orderId = await resolveReviewOrderId(
    supabase,
    user.id,
    productId,
    input.orderId,
  );

  const { error } = await supabase.from("reviews").insert({
    user_id: user.id,
    product_id: productId,
    order_id: orderId,
    rating,
    content,
  });
  if (error) {
    if (error.code === "23505") {
      throwActionError(
        "DUPLICATE_REVIEW",
        "이 주문에 대한 이 상품 리뷰는 이미 등록되어 있습니다.",
      );
    }
    if (error.code === "42501" || /row-level security/i.test(error.message)) {
      throwActionError(
        "PURCHASE_REQUIRED",
        "결제가 완료된 주문에서 구매한 상품만 리뷰를 작성할 수 있습니다.",
      );
    }
    throw new Error(error.message);
  }

  revalidatePath(`/products/${productId}`);
  revalidatePath("/account/reviews");
  revalidatePath("/account", "layout");
}

export async function updateReview(
  reviewId: string,
  productId: string,
  rating: number,
  content: string,
): Promise<void> {
  const rid = parseId(reviewId);
  const pid = parseId(productId);
  if (!rid || !pid) {
    throwActionError("VALIDATION", "리뷰 정보가 올바르지 않습니다.");
  }
  const validated = validateReviewInput(rating, content);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    throwActionError("AUTH_REQUIRED", "로그인이 필요합니다.");
  }

  const { data: existing, error: findError } = await supabase
    .from("reviews")
    .select("id, user_id")
    .eq("id", rid)
    .eq("product_id", pid)
    .maybeSingle();

  if (findError) throw new Error(findError.message);
  if (!existing) {
    throwActionError("NOT_FOUND", "리뷰를 찾을 수 없습니다.");
  }
  if (existing.user_id !== user.id) {
    throwActionError("FORBIDDEN", "본인의 리뷰만 수정할 수 있습니다.");
  }

  const { error: updateError } = await supabase
    .from("reviews")
    .update({
      rating: validated.rating,
      content: validated.content,
    })
    .eq("id", rid)
    .eq("product_id", pid)
    // DB 레벨 이중 체크
    .eq("user_id", user.id);

  if (updateError) throw new Error(updateError.message);
  revalidatePath(`/products/${pid}`);
  revalidatePath("/account/reviews");
  revalidatePath("/account", "layout");
}

export async function deleteReview(
  reviewId: string,
  productId: string,
): Promise<void> {
  const rid = parseId(reviewId);
  const pid = parseId(productId);
  if (!rid || !pid) {
    throwActionError("VALIDATION", "리뷰 정보가 올바르지 않습니다.");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    throwActionError("AUTH_REQUIRED", "로그인이 필요합니다.");
  }

  const { data: existing, error: findError } = await supabase
    .from("reviews")
    .select("id, user_id")
    .eq("id", rid)
    .eq("product_id", pid)
    .maybeSingle();

  if (findError) throw new Error(findError.message);
  if (!existing) {
    throwActionError("NOT_FOUND", "리뷰를 찾을 수 없습니다.");
  }
  if (existing.user_id !== user.id) {
    throwActionError("FORBIDDEN", "본인의 리뷰만 삭제할 수 있습니다.");
  }

  const { error: deleteError } = await supabase
    .from("reviews")
    .delete()
    .eq("id", rid)
    .eq("product_id", pid)
    // DB 레벨 이중 체크
    .eq("user_id", user.id);

  if (deleteError) throw new Error(deleteError.message);
  revalidatePath(`/products/${pid}`);
  revalidatePath("/account/reviews");
  revalidatePath("/account", "layout");
}
