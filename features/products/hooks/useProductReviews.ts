"use client";

import { QUERY_KEYS } from "@/commons/constants/query-keys";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { useQuery } from "@tanstack/react-query";

export type UseProductReviewsOptions = {
  /**
   * `reviews` 행이 없을 때 사용할 평균(예: `products.rating_average`)
   */
  fallbackRating?: number;
};

export type UseProductReviewsResult = {
  /** `reviews` 행 기준 개수 */
  reviewCount: number;
  /** 리뷰 기준 산술 평균(리뷰 없으면 0) */
  averageFromReviews: number;
  /** 별·숫자 표시용: 리뷰가 있으면 그 평균, 없으면 fallback */
  displayRating: number;
  /** 리뷰가 1건 이상일 때만 보조 문구 등 표시 */
  hasReviews: boolean;
  isPending: boolean;
  isError: boolean;
};

/**
 * `reviews` 테이블에서 특정 상품의 리뷰를 모두 가져와 개수·평균 별점을 계산합니다.
 */
export function useProductReviews(
  productId: string,
  options?: UseProductReviewsOptions,
): UseProductReviewsResult {
  const { data, isPending, isError, isSuccess } = useQuery({
    queryKey: QUERY_KEYS.reviews.byProduct(productId),
    queryFn: async () => {
      const supabase = getSupabaseBrowserClient();
      const { data: rows, error } = await supabase
        .from("reviews")
        .select("rating")
        .eq("product_id", productId);

      if (error) throw new Error(`리뷰 조회 실패: ${error.message}`);
      return rows ?? [];
    },
  });

  const list = data ?? [];
  const reviewCount = isSuccess ? list.length : 0;
  const averageFromReviews =
    reviewCount > 0
      ? list.reduce((sum, row) => sum + row.rating, 0) / reviewCount
      : 0;

  const fallback = options?.fallbackRating;
  const displayRating =
    reviewCount > 0
      ? Math.min(5, Math.max(0, averageFromReviews))
      : fallback !== undefined && fallback > 0
        ? Math.min(5, Math.max(0, fallback))
        : 0;

  return {
    reviewCount,
    averageFromReviews,
    displayRating,
    hasReviews: reviewCount > 0,
    isPending,
    isError,
  };
}
