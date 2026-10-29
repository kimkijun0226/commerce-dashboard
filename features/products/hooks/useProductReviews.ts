"use client";

import { QUERY_KEYS } from "@/commons/constants/query-keys";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { useQuery } from "@tanstack/react-query";

export type UseProductReviewsOptions = {
  /**
   * `reviews` 행이 없을 때 사용할 평균(예: `products.rating_average`)
   */
  fallbackRating?: number;
  fallbackCount?: number;
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
  isSuccess: boolean;
};

/**
 * 첫 화면은 서버 집계를 재사용하고, 리뷰 변경 시 최신 평점으로 갱신합니다.
 */
export function useProductReviews(
  productId: string,
  options?: UseProductReviewsOptions,
): UseProductReviewsResult {
  const { data, isPending, isError, isSuccess } = useQuery({
    queryKey: QUERY_KEYS.reviews.byProduct(productId),
    initialData: options?.fallbackCount !== undefined ? { count: options.fallbackCount, average: options.fallbackRating ?? 0 } : undefined,
    queryFn: async () => {
      const supabase = getSupabaseBrowserClient();
      const { data: rows, error } = await supabase
        .from("reviews")
        .select("rating")
        .eq("product_id", productId);

      if (error) throw new Error(`리뷰 조회 실패: ${error.message}`);
      const count = rows?.length ?? 0;
      return { count, average: count > 0 ? rows!.reduce((sum, row) => sum + row.rating, 0) / count : 0 };
    },
  });

  const reviewCount = data?.count ?? 0;
  const averageFromReviews = data?.average ?? 0;

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
    isSuccess,
  };
}
