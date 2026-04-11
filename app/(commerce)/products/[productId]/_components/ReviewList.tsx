"use client";

import { CommentsSectionHeader } from "@/app/(commerce)/products/[productId]/_components/CommentsSectionHeader";
import type { ReviewSortOption } from "@/app/(commerce)/products/[productId]/_components/reviewSort";
import { ReviewCard } from "@/app/(commerce)/products/[productId]/_components/ReviewCard";
import { cn } from "@/components/ui";
import type { ProductReviewListItem } from "@/features/reviews/api/getProductReviews";
import { useState } from "react";

const DEFAULT_PAGE_SIZE = 5;

export type ReviewListProps = {
  reviews: ProductReviewListItem[];
  isSuperAdmin?: boolean;
  pageSize?: number;
  sort: ReviewSortOption;
  onSortChange: (value: ReviewSortOption) => void;
  className?: string;
};

export function ReviewList({
  reviews,
  isSuperAdmin,
  pageSize = DEFAULT_PAGE_SIZE,
  sort,
  onSortChange,
  className,
}: ReviewListProps) {
  const [visible, setVisible] = useState(pageSize);

  const shown = reviews.slice(0, visible);
  const hasMore = visible < reviews.length;

  if (reviews.length === 0) {
    return (
      <div className={cn("flex flex-col gap-10", className)}>
        <CommentsSectionHeader
          reviewCount={0}
          sort={sort}
          onSortChange={onSortChange}
        />
        <p
          className="text-[15px] leading-7 text-[#6c7275]"
          style={{ fontFamily: "var(--commerce-font-body)" }}
        >
          아직 등록된 리뷰가 없습니다.
        </p>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col gap-10", className)}>
      <CommentsSectionHeader
        reviewCount={reviews.length}
        sort={sort}
        onSortChange={(v) => {
          onSortChange(v);
          setVisible(pageSize);
        }}
      />
      <ul className="flex flex-col" aria-label="리뷰 목록">
        {shown.map((r) => (
          <li
            key={r.id}
            className="border-b border-[#e8ecef] py-10 first:pt-2"
          >
            <ReviewCard review={r} isSuperAdmin={isSuperAdmin} />
          </li>
        ))}
      </ul>
      {hasMore ? (
        <div className="flex justify-center pt-4">
          <button
            type="button"
            onClick={() => setVisible((v) => v + pageSize)}
            className={cn(
              "inline-flex h-10 min-w-[158px] items-center justify-center rounded-full border border-[#141718] bg-transparent px-8",
              "text-base font-medium leading-7 tracking-[-0.4px] text-[#141718]",
              "transition-colors hover:bg-[#141718]/5 active:bg-[#141718]/10",
              "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--commerce-semantic-info)",
            )}
            style={{ fontFamily: "var(--commerce-font-body)" }}
          >
            더 보기
          </button>
        </div>
      ) : null}
    </div>
  );
}
