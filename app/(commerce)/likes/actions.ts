"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { COMMERCE_URLS } from "@/commons/constants/url";
import { AuthRequiredError } from "./errors";

type ToggleLikeResult = { isLiked: boolean };

function isDuplicateViolation(err: unknown): boolean {
  if (!err || typeof err !== "object") return false;
  const anyErr = err as { code?: string; message?: string };
  if (anyErr.code === "23505") return true;
  if (anyErr.message && anyErr.message.toLowerCase().includes("duplicate"))
    return true;
  return false;
}

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) throw new AuthRequiredError();
  return { supabase, user };
}

function revalidateForProduct(productId: string) {
  revalidatePath(COMMERCE_URLS.HOME);
  revalidatePath(COMMERCE_URLS.PRODUCTS);
  revalidatePath(COMMERCE_URLS.PRODUCT_DETAIL(productId));
}

export async function isProductLiked(productId: string): Promise<boolean> {
  const { supabase, user } = await requireUser();
  const { data, error } = await supabase
    .from("like_items")
    .select("id")
    .eq("user_id", user.id)
    .eq("product_id", productId)
    .maybeSingle();
  if (error) return false;
  return Boolean(data);
}

export async function getLikedProductIds(
  productIds: string[],
): Promise<string[]> {
  if (productIds.length === 0) return [];
  const { supabase, user } = await requireUser();
  const { data, error } = await supabase
    .from("like_items")
    .select("product_id")
    .eq("user_id", user.id)
    .in("product_id", productIds);
  if (error || !data) return [];
  return (data as { product_id: string }[]).map((r) => r.product_id);
}

export async function mergeGuestLikes(productIds: string[]): Promise<void> {
  if (productIds.length === 0) return;
  const { supabase, user } = await requireUser();
  const rows = productIds.map((productId) => ({
    user_id: user.id,
    product_id: productId,
  }));
  // 중복은 UNIQUE(user_id, product_id)에서 걸릴 수 있어 upsert로 흡수
  const { error } = await supabase
    .from("like_items")
    .upsert(rows, { onConflict: "user_id,product_id", ignoreDuplicates: true });
  if (error && !isDuplicateViolation(error)) throw error;
  // 목록/메인/상세 모두 갱신
  revalidatePath(COMMERCE_URLS.HOME);
  revalidatePath(COMMERCE_URLS.PRODUCTS);
}

export async function addLikeItem(productId: string): Promise<void> {
  const { supabase, user } = await requireUser();
  const { error } = await supabase.from("like_items").insert({
    user_id: user.id,
    product_id: productId,
  });
  if (error && !isDuplicateViolation(error)) throw error;
  revalidateForProduct(productId);
}

export async function removeLikeItem(productId: string): Promise<void> {
  const { supabase, user } = await requireUser();
  const { error } = await supabase
    .from("like_items")
    .delete()
    .eq("user_id", user.id)
    .eq("product_id", productId);
  if (error) throw error;
  revalidateForProduct(productId);
}

export async function toggleLikeItem(
  productId: string,
): Promise<ToggleLikeResult> {
  const { supabase, user } = await requireUser();

  const { data, error: readErr } = await supabase
    .from("like_items")
    .select("id")
    .eq("user_id", user.id)
    .eq("product_id", productId)
    .maybeSingle();
  if (readErr) throw readErr;

  if (data) {
    const { error } = await supabase.from("like_items").delete().eq("id", data.id);
    if (error) throw error;
    revalidateForProduct(productId);
    return { isLiked: false };
  }

  const { error } = await supabase.from("like_items").insert({
    user_id: user.id,
    product_id: productId,
  });
  if (error && !isDuplicateViolation(error)) throw error;

  revalidateForProduct(productId);
  return { isLiked: true };
}

