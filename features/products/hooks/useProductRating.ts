"use client";

import { QUERY_KEYS } from "@/commons/constants/query-keys";
import type { ProductDetail } from "@/commons/types/product";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { useQuery } from "@tanstack/react-query";

export type UseProductRatingResult = {
  /** 평균 별점 (리뷰 없으면 0) */
  rating: number;
  /** 리뷰 개수 */
  reviewCount: number;
  /** "{n} Reviews" 노출 여부 */
  showReviewCount: boolean;
};

export function useProductRating(product: ProductDetail): UseProductRatingResult {
  const { data, isSuccess } = useQuery({
    queryKey: QUERY_KEYS.reviews.count(product.id),
    queryFn: async () => {
      const supabase = getSupabaseBrowserClient();
      const { count, error } = await supabase
        .from("reviews")
        .select("id", { count: "exact", head: true })
        .eq("product_id", product.id);
      if (error) throw new Error(`리뷰 수 조회 실패: ${error.message}`);
      return count ?? 0;
    },
  });

  const count = isSuccess
    ? (data ?? 0)
    : (product.reviewCount ?? 0);

  const hasReviews = count > 0;
  const rating = hasReviews ? (product.rating ?? 0) : 0;

  return {
    rating,
    reviewCount: count,
    showReviewCount: hasReviews,
  };
}
