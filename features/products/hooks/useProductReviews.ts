"use client";

import { QUERY_KEYS } from "@/commons/constants/query-keys";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { useQuery } from "@tanstack/react-query";

export type UseProductReviewsResult = {
  /** `reviews` 행 기준 개수 */
  reviewCount: number;
  /** 리뷰 `rating` 산술 평균 (없으면 0) */
  averageRating: number;
  /** 5점 만점 별 UI용 정수(반올림) */
  ratingDisplay: number;
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
  const averageRating =
    reviewCount > 0
      ? list.reduce((sum, row) => sum + row.rating, 0) / reviewCount
      : 0;
  const ratingDisplay = Math.min(
    5,
    Math.max(0, Math.round(averageRating)),
  );

  return {
    reviewCount,
    averageRating,
    ratingDisplay,
    hasReviews: reviewCount > 0,
    isPending,
    isError,
  };
}
