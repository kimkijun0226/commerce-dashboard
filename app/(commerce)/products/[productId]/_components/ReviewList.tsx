"use client";

// 리뷰 첫 페이지는 서버 데이터로 시작하고, 이후 페이지는 클라이언트에서 이어서 불러옵니다.
import { ReviewListItem } from "@/app/(commerce)/products/[productId]/_components/ReviewListItem";
import { ReviewLoadMoreButton } from "@/app/(commerce)/products/[productId]/_components/ReviewLoadMoreButton";
import { QUERY_KEYS } from "@/commons/constants/query-keys";
import { cn } from "@/components/ui";
import {
  fetchProductReviewsPage,
  type Review,
} from "@/features/products/api/useProductReviews";
import { useQueries } from "@tanstack/react-query";
import { useMemo, useState } from "react";

const PAGE_SIZE = 5;

export type ReviewListProps = {
  productId: string;
  initialReviews?: Review[];
  currentUserId?: string | null;
  isSuperAdmin?: boolean;
  /** 리뷰 수정·삭제 등 반영 후 — 예: AI 요약 백그라운드 갱신 트리거 */
  onAfterMutate?: () => void;
  className?: string;
};

// 서버 initialData를 시작점으로 사용하는 리뷰 목록과 더 보기 버튼입니다.
export function ReviewList({
  productId,
  initialReviews,
  currentUserId,
  isSuperAdmin,
  onAfterMutate,
  className,
}: ReviewListProps) {
  const [loadedPages, setLoadedPages] = useState<number[]>([1]);

  const queries = useQueries({
    queries: loadedPages.map((page) => ({
      queryKey: QUERY_KEYS.reviews.page(productId, page),
      queryFn: () => fetchProductReviewsPage(productId, page, PAGE_SIZE),
      initialData: page === 1 ? initialReviews : undefined,
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

  // 현재 마지막 페이지 다음 번호를 계산해 로딩 대상 배열에 추가합니다.
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
            <ReviewListItem
              review={r}
              productId={productId}
              currentUserId={currentUserId ?? null}
              isSuperAdmin={isSuperAdmin}
              onAfterMutate={onAfterMutate}
            />
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
