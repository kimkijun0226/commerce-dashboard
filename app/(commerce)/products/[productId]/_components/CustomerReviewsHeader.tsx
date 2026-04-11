"use client";

import { RatingStars } from "@/components/commerce/RatingStars/RatingStars";
import { cn } from "@/components/ui";

export type CustomerReviewsHeaderProps = {
  averageRating: number;
  reviewCount: number;
  className?: string;
};

/**
 * Figma Review Section 헤더 (48:9221): Customer Reviews + 별 + "N Reviews"
 * — 큰 숫자 평균 없음, 두 줄 구조
 */
export function CustomerReviewsHeader({
  averageRating,
  reviewCount,
  className,
}: CustomerReviewsHeaderProps) {
  return (
    <header className={cn("flex flex-col gap-4", className)}>
      <h2
        className="text-[28px] font-medium leading-[34px] tracking-[-0.6px] text-[#23262f]"
        style={{ fontFamily: "var(--commerce-font-heading)" }}
      >
        Customer Reviews
      </h2>
      <div className="flex flex-wrap items-center gap-3">
        <RatingStars
          value={reviewCount > 0 ? averageRating : 0}
          size="figma"
          palette="product"
          aria-label={
            reviewCount > 0
              ? `Average rating ${averageRating} out of 5`
              : "No ratings yet"
          }
        />
        <span
          className="text-xs leading-5 text-[#141718]"
          style={{ fontFamily: "var(--commerce-font-body)" }}
        >
          {reviewCount} {reviewCount === 1 ? "Review" : "Reviews"}
        </span>
      </div>
    </header>
  );
}
