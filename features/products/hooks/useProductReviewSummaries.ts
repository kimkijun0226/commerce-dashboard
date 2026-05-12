"use client";

import { QUERY_KEYS } from "@/commons/constants/query-keys";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

export type ProductReviewSummary = {
  reviewCount: number;
  averageRating: number;
};

function toMap(
  summaries: Record<string, ProductReviewSummary>,
): Map<string, ProductReviewSummary> {
  return new Map(Object.entries(summaries));
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
      const res = await fetch("/api/catalog/review-summaries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productIds: sortedUniqueIds }),
      });
      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(text || "리뷰 요약 조회 실패");
      }
      const json = (await res.json()) as {
        summaries?: Record<string, ProductReviewSummary>;
      };
      return toMap(json.summaries ?? {});
    },
    enabled: sortedUniqueIds.length > 0,
  });
}
