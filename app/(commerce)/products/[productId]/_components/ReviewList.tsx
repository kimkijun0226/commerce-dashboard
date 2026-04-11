"use client";

import { ReviewListItem } from "@/app/(commerce)/products/[productId]/_components/ReviewListItem";
import { ReviewLoadMoreButton } from "@/app/(commerce)/products/[productId]/_components/ReviewLoadMoreButton";
import { QUERY_KEYS } from "@/commons/constants/query-keys";
import { cn } from "@/components/ui";
import { fetchProductReviewsPage } from "@/features/products/api/useProductReviews";
import { useQueries } from "@tanstack/react-query";
import { useMemo, useState } from "react";

const PAGE_SIZE = 5;

export type ReviewListProps = {
  productId: string;
  currentUserId?: string | null;
  isSuperAdmin?: boolean;
  className?: string;
};

export function ReviewList({
  productId,
  currentUserId,
  isSuperAdmin,
  className,
}: ReviewListProps) {
  void currentUserId;
  const [loadedPages, setLoadedPages] = useState<number[]>([1]);

  const queries = useQueries({
    queries: loadedPages.map((page) => ({
      queryKey: QUERY_KEYS.reviews.page(productId, page),
      queryFn: () => fetchProductReviewsPage(productId, page, PAGE_SIZE),
      staleTime: 60 * 1000,
    })),
  });

  const allReviews = useMemo(
    () => loadedPages.flatMap((_, idx) => queries[idx]?.data ?? []),
    [loadedPages, queries],
  );

  const firstQuery = queries[0];
  const lastQuery = queries[queries.length - 1];

  const isInitialLoading = Boolean(firstQuery?.isPending);
  const isInitialError = Boolean(firstQuery?.isError);

  const hasMore = (lastQuery?.data?.length ?? 0) === PAGE_SIZE;
  const isLoadingMore =
    loadedPages.length >= 2 && Boolean(lastQuery?.isFetching);

  const handleLoadMore = () => {
    const next = Math.max(...loadedPages) + 1;
    setLoadedPages((prev) => (prev.includes(next) ? prev : [...prev, next]));
  };

  if (isInitialError) {
    return (
      <p
        className={cn("text-[15px] leading-7 text-[#b42318]", className)}
        role="alert"
        style={{ fontFamily: "var(--commerce-font-body)" }}
      >
        리뷰를 불러오지 못했습니다.
      </p>
    );
  }

  if (isInitialLoading) {
    return (
      <p
        className={cn("text-[15px] leading-7 text-[#6c7275]", className)}
        style={{ fontFamily: "var(--commerce-font-body)" }}
      >
        리뷰를 불러오는 중…
      </p>
    );
  }

  if (allReviews.length === 0) {
    return (
      <p
        className={cn("text-[15px] leading-7 text-[#6c7275]", className)}
        style={{ fontFamily: "var(--commerce-font-body)" }}
      >
        아직 등록된 리뷰가 없습니다.
      </p>
    );
  }

  return (
    <div className={cn("flex flex-col gap-10", className)}>
      <ul className="flex flex-col" aria-label="리뷰 목록">
        {allReviews.map((r) => (
          <li
            key={r.id}
            className="border-b border-[#e8ecef] py-10 first:pt-2"
          >
            <ReviewListItem review={r} isSuperAdmin={isSuperAdmin} />
          </li>
        ))}
      </ul>
      {hasMore ? (
        <ReviewLoadMoreButton
          onClick={handleLoadMore}
          isLoading={isLoadingMore}
        />
      ) : null}
    </div>
  );
}
