"use client";

import type { Product } from "@/components/commerce/types";
import { useMemo } from "react";
import { useProductReviewSummaries } from "./useProductReviewSummaries";

/**
 * 카탈로그 상품 목록에 Supabase `reviews` 기준 별점·리뷰 수를 병합합니다.
 * 요약 로딩 중에는 원본 상품 데이터(예: `rating_average`)를 그대로 둡니다.
 */
export function useEnrichedCatalogProducts(products: Product[]) {
  const ids = useMemo(() => products.map((p) => p.id), [products]);
  const { data: summaryMap, isPending, isError } = useProductReviewSummaries(ids);

  const enrichedProducts = useMemo((): Product[] => {
    if (summaryMap === undefined) {
      return products;
    }
    return products.map((p) => {
      const s = summaryMap.get(p.id);
      if (!s) {
        return { ...p, rating: p.rating, reviewCount: undefined };
      }
      return {
        ...p,
        rating: s.averageRating,
        reviewCount: s.reviewCount,
      };
    });
  }, [products, summaryMap]);

  return {
    enrichedProducts,
    isReviewSummariesPending: isPending,
    isReviewSummariesError: isError,
  };
}
