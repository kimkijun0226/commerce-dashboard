"use client";

import { CommentsSectionHeader } from "@/app/(commerce)/products/[productId]/_components/CommentsSectionHeader";
import { ReviewCard } from "@/app/(commerce)/products/[productId]/_components/ReviewCard";
import { cn } from "@/components/ui";
import type { ProductReviewListItem } from "@/features/reviews/api/getProductReviews";
import { useState } from "react";

const DEFAULT_PAGE_SIZE = 5;

export type ReviewListProps = {
  reviews: ProductReviewListItem[];
  isSuperAdmin?: boolean;
  pageSize?: number;
  className?: string;
};

/** Figma Comment section: 제목 행 + 리스트 + Load more (outline pill) */
export function ReviewList({
  reviews,
  isSuperAdmin,
  pageSize = DEFAULT_PAGE_SIZE,
  className,
}: ReviewListProps) {
  const [visible, setVisible] = useState(pageSize);

  const shown = reviews.slice(0, visible);
  const hasMore = visible < reviews.length;

  if (reviews.length === 0) {
    return (
      <div className={cn("flex flex-col gap-10", className)}>
        <CommentsSectionHeader reviewCount={0} />
        <p
          className="text-(--commerce-text-tertiary)"
          style={{ fontFamily: "var(--commerce-font-body)" }}
        >
          No reviews yet.
        </p>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col gap-10", className)}>
      <CommentsSectionHeader reviewCount={reviews.length} />
      <ul className="flex flex-col gap-0" aria-label="Customer reviews">
        {shown.map((r) => (
          <li key={r.id} className="pt-0 first:pt-0">
            <ReviewCard review={r} isSuperAdmin={isSuperAdmin} />
          </li>
        ))}
      </ul>
      {hasMore ? (
        <div className="flex justify-center pt-2">
          <button
            type="button"
            onClick={() => setVisible((v) => v + pageSize)}
            className={cn(
              "inline-flex h-10 min-w-[158px] items-center justify-center rounded-full border border-[#141718] bg-transparent px-8",
              "text-base font-medium leading-7 tracking-[-0.4px] text-[#141718]",
              "transition-colors hover:bg-[#141718]/5",
              "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--commerce-semantic-info)",
            )}
            style={{ fontFamily: "var(--commerce-font-body)" }}
          >
            Load more
          </button>
        </div>
      ) : null}
    </div>
  );
}
