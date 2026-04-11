"use client";

import { ReviewSortDropdown } from "@/app/(commerce)/products/[productId]/_components/ReviewSortDropdown";
import type { ReviewSortOption } from "@/app/(commerce)/products/[productId]/_components/reviewSort";
import { cn } from "@/components/ui";

export type { ReviewSortOption };

export type CommentsSectionHeaderProps = {
  reviewCount: number;
  sort?: ReviewSortOption;
  onSortChange: (value: ReviewSortOption) => void;
  className?: string;
};

export function CommentsSectionHeader({
  reviewCount,
  sort = "newest",
  onSortChange,
  className,
}: CommentsSectionHeaderProps) {
  return (
    <div
      className={cn(
        "flex min-h-12 flex-wrap items-center justify-between gap-4",
        className,
      )}
    >
      <h3
        className="text-[28px] font-medium leading-[34px] tracking-[-0.6px] text-black"
        style={{ fontFamily: "var(--commerce-font-heading)" }}
      >
        리뷰 {reviewCount}개
      </h3>
      <ReviewSortDropdown value={sort} onChange={onSortChange} />
    </div>
  );
}
