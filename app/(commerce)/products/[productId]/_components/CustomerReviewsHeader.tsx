"use client";

import { RatingStars } from "@/components/commerce/RatingStars/RatingStars";
import { cn } from "@/components/ui";

export type CustomerReviewsHeaderProps = {
  averageRating: number;
  reviewCount: number;
  className?: string;
};

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
        고객 리뷰
      </h2>
      <div className="flex flex-wrap items-center gap-3">
        <RatingStars
          value={reviewCount > 0 ? averageRating : 0}
          size="figma"
          palette="product"
          aria-label={
            reviewCount > 0
              ? `평균 평점 ${averageRating}점`
              : "아직 평점 없음"
          }
        />
        <span
          className="text-xs leading-5 text-[#141718]"
          style={{ fontFamily: "var(--commerce-font-body)" }}
        >
          리뷰 {reviewCount}개
        </span>
      </div>
    </header>
  );
}
