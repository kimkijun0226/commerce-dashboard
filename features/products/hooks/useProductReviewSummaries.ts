"use client";

import { QUERY_KEYS } from "@/commons/constants/query-keys";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

export type ProductReviewSummary = {
  reviewCount: number;
  averageRating: number;
  ratingDisplay: number;
};

function aggregateByProductId(
  rows: { product_id: string; rating: number }[],
): Map<string, ProductReviewSummary> {
  const buckets = new Map<string, number[]>();
  for (const row of rows) {
    const list = buckets.get(row.product_id) ?? [];
    list.push(row.rating);
    buckets.set(row.product_id, list);
  }
  const out = new Map<string, ProductReviewSummary>();
  for (const [productId, ratings] of buckets) {
    const reviewCount = ratings.length;
    const averageRating =
      ratings.reduce((sum, r) => sum + r, 0) / reviewCount;
    const ratingDisplay = Math.min(
      5,
      Math.max(0, Math.round(averageRating)),
    );
    out.set(productId, { reviewCount, averageRating, ratingDisplay });
  }
  return out;
}

/**
 * Supabase `reviews`에서 주어진 상품 id들에 대한 리뷰를 한 번에 가져와
 * 상품별 개수·평균 별점을 계산합니다. (목록·그리드용)
 */
export function useProductReviewSummaries(productIds: string[]) {
  const sortedUniqueIds = useMemo(
    () => [...new Set(productIds)].sort(),
    [productIds],
  );

  return useQuery({
    queryKey: QUERY_KEYS.reviews.summaryByProductIds(sortedUniqueIds),
    queryFn: async () => {
      const supabase = getSupabaseBrowserClient();
      const { data, error } = await supabase
        .from("reviews")
        .select("product_id, rating")
        .in("product_id", [...sortedUniqueIds]);

      if (error) {
        throw new Error(`리뷰 요약 조회 실패: ${error.message}`);
      }
      return aggregateByProductId(data ?? []);
    },
    enabled: sortedUniqueIds.length > 0,
  });
}
