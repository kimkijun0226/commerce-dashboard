import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/supabase";

export type ProductReviewListItem = Pick<
  Database["public"]["Tables"]["reviews"]["Row"],
  "id" | "rating" | "content" | "created_at"
>;

export async function getProductReviewsByProductId(
  productId: string,
): Promise<ProductReviewListItem[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("reviews")
    .select("id, rating, content, created_at")
    .eq("product_id", productId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`리뷰 조회 실패: ${error.message}`);
  }

  return (data ?? []) as ProductReviewListItem[];
}
