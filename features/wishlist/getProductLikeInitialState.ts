import { createClient } from "@/lib/supabase/server";

/** 로그인 사용자 기준 상품 찜 여부 (비로그인은 false) */
export async function getProductLikeInitialState(
  productId: string,
): Promise<boolean> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return false;

  const { data, error } = await supabase
    .from("like_items")
    .select("id")
    .eq("user_id", user.id)
    .eq("product_id", productId)
    .maybeSingle();

  if (error) return false;
  return data != null;
}
