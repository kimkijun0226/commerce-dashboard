"use client";

import type { ReviewSortOption } from "@/app/(commerce)/products/[productId]/_components/reviewSort";
import { cn } from "@/components/ui";
import { FiChevronDown } from "react-icons/fi";

export type { ReviewSortOption };

const SORT_LABELS: Record<ReviewSortOption, string> = {
  newest: "최신순",
  oldest: "오래된순",
};

export type CommentsSectionHeaderProps = {
  reviewCount: number;
  sort?: ReviewSortOption;
  onSortChange?: (value: ReviewSortOption) => void;
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
      <div className="relative min-w-[200px] sm:min-w-[256px]">
        <select
          aria-label="리뷰 정렬"
          value={sort}
          onChange={(e) =>
            onSortChange?.(e.target.value as ReviewSortOption)
          }
          className={cn(
            "h-12 w-full min-w-[200px] cursor-pointer appearance-none rounded-lg border border-[#e8ecef] bg-white py-0 pr-10 pl-4 shadow-sm",
            "text-base font-semibold leading-[26px] text-[#141718]",
            "transition-shadow hover:shadow-md",
            "focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-(--commerce-semantic-info)",
          )}
          style={{ fontFamily: "var(--commerce-font-body)" }}
        >
          {(Object.keys(SORT_LABELS) as ReviewSortOption[]).map((key) => (
            <option key={key} value={key}>
              {SORT_LABELS[key]}
            </option>
          ))}
        </select>
        <FiChevronDown
          className="pointer-events-none absolute top-1/2 right-3 size-6 -translate-y-1/2 text-[#141718]"
          aria-hidden
        />
      </div>
    </div>
  );
}
