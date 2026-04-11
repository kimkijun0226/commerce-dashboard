"use client";

import { cn } from "@/components/ui";
import { FiChevronDown } from "react-icons/fi";

export type ReviewSortOption = "newest";

export type CommentsSectionHeaderProps = {
  reviewCount: number;
  sort?: ReviewSortOption;
  onSortChange?: (value: ReviewSortOption) => void;
  className?: string;
};

/** Figma Comments title (48:9194): Poppins 28 + 정렬 드롭다운 48h */
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
        {reviewCount} {reviewCount === 1 ? "Review" : "Reviews"}
      </h3>
      <div className="relative min-w-[256px]">
        <select
          aria-label="Sort reviews"
          value={sort}
          onChange={(e) =>
            onSortChange?.(e.target.value as ReviewSortOption)
          }
          className={cn(
            "h-12 w-full min-w-[256px] cursor-pointer appearance-none rounded-lg border border-[#e8ecef] bg-white py-0 pr-10 pl-4",
            "text-base font-semibold leading-[26px] text-[#141718]",
            "focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-(--commerce-semantic-info)",
          )}
          style={{ fontFamily: "var(--commerce-font-body)" }}
        >
          <option value="newest">Newest</option>
        </select>
        <FiChevronDown
          className="pointer-events-none absolute top-1/2 right-3 size-6 -translate-y-1/2 text-[#141718]"
          aria-hidden
        />
      </div>
    </div>
  );
}
