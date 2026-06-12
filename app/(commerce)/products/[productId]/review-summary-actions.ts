"use server";

// 상품 리뷰 요약의 조회/생성/교체와, 저장 권한 우회를 한 곳에서 처리하는 서버 액션 모음입니다.
import { revalidatePath } from "next/cache";
import {
  parseAiReviewSummaryFromProductJson,
  parseProductReviewSummary,
} from "@/commons/types/product-review-summary";
import type { ReviewSummaryResult } from "@/lib/ai/review-summary";
import {
  generateFullReviewSummary,
  generateIncrementalReviewSummary,
} from "@/lib/ai/review-summary";
import { checkAdminAccess } from "@/lib/auth/admin";
import { createClient } from "@/lib/supabase/server";
import { createServiceRoleSupabaseClient } from "@/lib/supabase/service-role";
import type { Json } from "@/types/supabase";

export type GenerateAiReviewSummaryResult =
  | {
      ok: true;
      summary: ReviewSummaryResult;
      previousSummary: ReviewSummaryResult | null;
    }
  | { ok: false; error: string };

// 다양한 입력 형태에서 상품 id를 문자열로 정리합니다.
function parseProductId(value: unknown): string {
  return String(value ?? "").trim();
}

// count/highlight 메타데이터는 유지하고 AI 필드만 새 요약으로 합칩니다.
function mergeReviewSummaryJson(
  current: Json | null | undefined,
  ai: ReviewSummaryResult,
  reviewCount: number,
): Json {
  const prev = parseProductReviewSummary(current ?? null);
  const payload: Record<string, unknown> = {
    count: reviewCount,
    highlight: prev?.highlight ?? "",
    ai,
  };
  return payload as unknown as Json;
}

const EMPTY_AI_SUMMARY: ReviewSummaryResult = {
  summary: "",
  positive_points: [],
  negative_points: [],
  keywords: [],
};

type ServerSupabase = Awaited<ReturnType<typeof createClient>>;

// 사용자 RPC, service_role RPC, 직접 update 순서로 저장을 시도해 환경별 권한 차이를 흡수합니다.
async function saveMergedReviewSummaryViaRpcOrFallback(
  userSb: ServerSupabase,
  isAdmin: boolean,
  serviceSb: ReturnType<typeof createServiceRoleSupabaseClient>,
  productId: string,
  merged: Json,
  logPrefix: string,
): Promise<void> {
  const rpcArgs = {
    p_product_id: productId,
    p_review_summary: merged,
  } as const;

  const { error: userRpcError } = await userSb.rpc(
    "update_product_review_summary_for_reviewer",
    rpcArgs,
  );
  if (!userRpcError) {
    revalidatePath(`/products/${encodeURIComponent(productId)}`);
    return;
  }

  console.warn(`[${logPrefix}] 사용자 RPC 실패:`, userRpcError.message);

  if (serviceSb) {
    const { error: serviceRpcError } = await serviceSb.rpc(
      "update_product_review_summary_for_reviewer",
      rpcArgs,
    );
    if (!serviceRpcError) {
      revalidatePath(`/products/${encodeURIComponent(productId)}`);
      return;
    }
    console.warn(`[${logPrefix}] service_role RPC 실패:`, serviceRpcError.message);
  }

  if (isAdmin) {
    const { error: adminUpdateError } = await userSb
      .from("products")
      .update({ review_summary: merged })
      .eq("id", productId);
    if (!adminUpdateError) {
      revalidatePath(`/products/${encodeURIComponent(productId)}`);
      return;
    }
    console.error(`[${logPrefix}]`, adminUpdateError);
    return;
  }

  if (serviceSb) {
    const { error: serviceUpdateError } = await serviceSb
      .from("products")
      .update({ review_summary: merged })
      .eq("id", productId);
    if (!serviceUpdateError) {
      revalidatePath(`/products/${encodeURIComponent(productId)}`);
      return;
    }
    console.error(`[${logPrefix}]`, serviceUpdateError);
    return;
  }

  console.warn(
    `[${logPrefix}] 저장 실패. supabase/migrations/0020·0021 SQL 적용 및 SUPABASE_SECRET_KEY를 확인하세요.`,
    userRpcError,
  );
}

/**
 * 새 리뷰 등록 직후 `products.review_summary.ai`를 증분 갱신합니다.
 * Gemini/DB 오류 시에도 예외를 밖으로 던지지 않습니다(리뷰 등록은 이미 완료된 상태).
 */
export async function applyIncrementalReviewSummaryAfterCreate(
  productId: string,
  newReview: { rating: number; content: string },
): Promise<void> {
  const id = parseProductId(productId);
  if (!id) return;

  try {
    const userSb = await createClient();
    const isAdmin = await checkAdminAccess();
    const serviceSb = createServiceRoleSupabaseClient();

    const { data: productRow, error: productError } = await userSb
      .from("products")
      .select("review_summary")
      .eq("id", id)
      .maybeSingle();

    if (productError) {
      console.error("[applyIncrementalReviewSummaryAfterCreate]", productError);
      return;
    }

    const existingAi = parseAiReviewSummaryFromProductJson(
      productRow?.review_summary ?? null,
    );

    const ai = await generateIncrementalReviewSummary(existingAi, {
      rating: newReview.rating,
      content: newReview.content,
    });

    const { count, error: countError } = await userSb
      .from("reviews")
      .select("*", { count: "exact", head: true })
      .eq("product_id", id);

    if (countError) {
      console.error("[applyIncrementalReviewSummaryAfterCreate]", countError);
      return;
    }

    const merged = mergeReviewSummaryJson(
      productRow?.review_summary ?? null,
      ai,
      count ?? 0,
    );

    await saveMergedReviewSummaryViaRpcOrFallback(
      userSb,
      isAdmin,
      serviceSb,
      id,
      merged,
      "applyIncrementalReviewSummaryAfterCreate",
    );
  } catch (e) {
    console.error("[applyIncrementalReviewSummaryAfterCreate]", e);
  }
}

/**
 * 리뷰 수정·삭제 등으로 DB 상태가 바뀐 뒤, 해당 상품의 전체 리뷰를 다시 읽어 AI 요약을 재생성합니다.
 * 오류는 삼키고 로그만 남깁니다(리뷰 변경은 이미 반영된 상태).
 */
export async function applyFullReviewSummaryAfterReviewMutation(
  productId: string,
): Promise<void> {
  const id = parseProductId(productId);
  if (!id) return;

  try {
    const userSb = await createClient();
    const isAdmin = await checkAdminAccess();
    const serviceSb = createServiceRoleSupabaseClient();

    const { data: reviewRows, error: reviewsError } = await userSb
      .from("reviews")
      .select("rating, content")
      .eq("product_id", id)
      .not("content", "is", null);

    if (reviewsError) {
      console.error("[applyFullReviewSummaryAfterReviewMutation]", reviewsError);
      return;
    }

    const reviews = (reviewRows ?? [])
      .filter(
        (r) =>
          r.content != null &&
          String(r.content).trim().length > 0 &&
          typeof r.rating === "number",
      )
      .map((r) => ({
        rating: Number(r.rating),
        content: String(r.content).trim(),
      }));

    const { data: productRow, error: productError } = await userSb
      .from("products")
      .select("review_summary")
      .eq("id", id)
      .maybeSingle();

    if (productError) {
      console.error("[applyFullReviewSummaryAfterReviewMutation]", productError);
      return;
    }

    const { count, error: countError } = await userSb
      .from("reviews")
      .select("*", { count: "exact", head: true })
      .eq("product_id", id);

    if (countError) {
      console.error("[applyFullReviewSummaryAfterReviewMutation]", countError);
      return;
    }

    const reviewCount = count ?? 0;
    const ai =
      reviews.length > 0
        ? await generateFullReviewSummary(reviews)
        : EMPTY_AI_SUMMARY;

    const merged = mergeReviewSummaryJson(
      productRow?.review_summary ?? null,
      ai,
      reviewCount,
    );

    await saveMergedReviewSummaryViaRpcOrFallback(
      userSb,
      isAdmin,
      serviceSb,
      id,
      merged,
      "applyFullReviewSummaryAfterReviewMutation",
    );
  } catch (e) {
    console.error("[applyFullReviewSummaryAfterReviewMutation]", e);
  }
}

/**
 * DB에 저장된 상품의 AI 리뷰 요약(JSON의 `ai` 필드)을 조회합니다.
 */
// 상품 상세에서 표시할 현재 AI 요약만 가볍게 읽어 옵니다.
export async function getReviewSummary(
  productId: string,
): Promise<ReviewSummaryResult | null> {
  const id = parseProductId(productId);
  if (!id) return null;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("review_summary")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("[getReviewSummary]", error);
    return null;
  }

  return parseAiReviewSummaryFromProductJson(data?.review_summary ?? null);
}

// 관리자 승인/거부 흐름에서 현재 상품의 AI 요약만 교체합니다.
export async function replaceAiReviewSummary(
  productId: string,
  nextSummary: ReviewSummaryResult | null,
): Promise<GenerateAiReviewSummaryResult> {
  const id = parseProductId(productId);
  if (!id) {
    return { ok: false, error: "상품 ID가 올바르지 않습니다." };
  }

  try {
    const isAdmin = await checkAdminAccess();
    if (!isAdmin) {
      return { ok: false, error: "관리자만 요약을 변경할 수 있습니다." };
    }

    const supabase = await createClient();
    const { data: productRow, error: productError } = await supabase
      .from("products")
      .select("review_summary")
      .eq("id", id)
      .maybeSingle();

    if (productError) {
      console.error("[replaceAiReviewSummary]", productError);
      return { ok: false, error: productError.message };
    }

    const previousSummary = parseAiReviewSummaryFromProductJson(
      productRow?.review_summary ?? null,
    );

    const { count, error: countError } = await supabase
      .from("reviews")
      .select("*", { count: "exact", head: true })
      .eq("product_id", id);

    if (countError) {
      console.error("[replaceAiReviewSummary]", countError);
      return { ok: false, error: countError.message };
    }

    // AI 필드만 교체하되, 기존 count/highlight 메타데이터는 유지합니다.
    const prev = parseProductReviewSummary(productRow?.review_summary ?? null);
    const payload: Record<string, unknown> = {
      count: count ?? 0,
      highlight: prev?.highlight ?? "",
    };
    if (nextSummary) {
      payload.ai = nextSummary;
    }

    const { error: updateError } = await supabase
      .from("products")
      .update({ review_summary: payload as Json })
      .eq("id", id);

    if (updateError) {
      console.error("[replaceAiReviewSummary]", updateError);
      return { ok: false, error: updateError.message };
    }

    revalidatePath(`/products/${encodeURIComponent(id)}`);
    return {
      ok: true,
      summary: nextSummary ?? EMPTY_AI_SUMMARY,
      previousSummary,
    };
  } catch (e) {
    console.error("[replaceAiReviewSummary]", e);
    const message =
      e instanceof Error ? e.message : "요약 변경에 실패했습니다.";
    return { ok: false, error: message };
  }
}

/**
 * 관리자만 호출 가능. 전체 리뷰로 AI 요약을 생성해 `products.review_summary`에 병합 저장합니다.
 */
// 관리자 수동 재생성 요청으로 전체 리뷰를 다시 요약해 저장합니다.
export async function generateAiReviewSummary(
  productId: string,
): Promise<GenerateAiReviewSummaryResult> {
  const id = parseProductId(productId);
  if (!id) {
    return { ok: false, error: "상품 ID가 올바르지 않습니다." };
  }

  try {
    const isAdmin = await checkAdminAccess();
    if (!isAdmin) {
      return { ok: false, error: "관리자만 요약을 생성할 수 있습니다." };
    }

    const supabase = await createClient();

    const { data: reviewRows, error: reviewsError } = await supabase
      .from("reviews")
      .select("rating, content")
      .eq("product_id", id)
      .not("content", "is", null);

    if (reviewsError) {
      console.error("[generateAiReviewSummary]", reviewsError);
      return { ok: false, error: reviewsError.message };
    }

    // 비어 있는 리뷰는 요약 품질을 떨어뜨리므로 모델 입력에서 제외합니다.
    const reviews = (reviewRows ?? [])
      .filter(
        (r) =>
          r.content != null &&
          String(r.content).trim().length > 0 &&
          typeof r.rating === "number",
      )
      .map((r) => ({
        rating: Number(r.rating),
        content: String(r.content).trim(),
      }));

    if (reviews.length === 0) {
      return { ok: false, error: "요약할 리뷰가 없습니다." };
    }

    const ai = await generateFullReviewSummary(reviews);

    const { data: productRow, error: productError } = await supabase
      .from("products")
      .select("review_summary")
      .eq("id", id)
      .maybeSingle();

    if (productError) {
      console.error("[generateAiReviewSummary]", productError);
      return { ok: false, error: productError.message };
    }

    const previousSummary = parseAiReviewSummaryFromProductJson(
      productRow?.review_summary ?? null,
    );

    const merged = mergeReviewSummaryJson(
      productRow?.review_summary ?? null,
      ai,
      reviews.length,
    );

    const { error: updateError } = await supabase
      .from("products")
      .update({ review_summary: merged })
      .eq("id", id);

    if (updateError) {
      console.error("[generateAiReviewSummary]", updateError);
      return { ok: false, error: updateError.message };
    }

    revalidatePath(`/products/${encodeURIComponent(id)}`);
    return { ok: true, summary: ai, previousSummary };
  } catch (e) {
    console.error("[generateAiReviewSummary]", e);
    const message =
      e instanceof Error ? e.message : "요약 생성에 실패했습니다.";
    return { ok: false, error: message };
  }
}
