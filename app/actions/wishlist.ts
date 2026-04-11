"use server";

import { AuthRequiredError } from "@/commons/errors/auth-required-error";
import { createClient } from "@/lib/supabase/server";

export type ToggleLikeItemResult = { liked: boolean };

export async function toggleLikeItem(
  productId: string,
): Promise<ToggleLikeItemResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new AuthRequiredError();
  }

  const { data: existing, error: selectError } = await supabase
    .from("like_items")
    .select("id")
    .eq("user_id", user.id)
    .eq("product_id", productId)
    .maybeSingle();

  if (selectError) {
    throw new Error(selectError.message);
  }

  if (existing) {
    const { error: deleteError } = await supabase
      .from("like_items")
      .delete()
      .eq("id", existing.id);

    if (deleteError) {
      throw new Error(deleteError.message);
    }
    return { liked: false };
  }

  const { error: insertError } = await supabase.from("like_items").insert({
    user_id: user.id,
    product_id: productId,
  });

  if (insertError) {
    throw new Error(insertError.message);
  }

  return { liked: true };
}
