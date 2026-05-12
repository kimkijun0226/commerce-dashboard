import { createClient } from "@/lib/supabase/server";

export type ProductReviewSummary = {
  reviewCount: number;
  averageRating: number;
};

function aggregateByProductId(
  rows: { product_id: string; rating: number }[],
): Record<string, ProductReviewSummary> {
  const buckets = new Map<string, number[]>();
  for (const row of rows) {
    const list = buckets.get(row.product_id) ?? [];
    list.push(row.rating);
    buckets.set(row.product_id, list);
  }
  const out: Record<string, ProductReviewSummary> = {};
  for (const [productId, ratings] of buckets) {
    const reviewCount = ratings.length;
    const averageRating = ratings.reduce((sum, r) => sum + r, 0) / reviewCount;
    out[productId] = { reviewCount, averageRating };
  }
  return out;
}

export async function getReviewSummariesByProductIds(productIds: string[]) {
  const ids = [...new Set(productIds.map((v) => String(v).trim()).filter(Boolean))];
  if (ids.length === 0) return {};

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("reviews")
    .select("product_id, rating")
    .in("product_id", ids);

  if (error) {
    throw new Error(`리뷰 요약 조회 실패: ${error.message}`);
  }
  return aggregateByProductId((data ?? []) as { product_id: string; rating: number }[]);
}

