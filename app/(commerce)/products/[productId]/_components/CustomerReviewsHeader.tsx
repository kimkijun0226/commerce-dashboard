"use client";

import { commerceColors } from "@/commons/constants/color";
import { commerceTypography } from "@/commons/constants/typography";
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
  const averageLabel =
    reviewCount > 0 ? (Math.round(averageRating * 10) / 10).toFixed(1) : "0.0";

  return (
    <header
      className={cn(
        "flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between",
        className,
      )}
    >
      <h2
        className="text-[28px] font-medium leading-[34px] tracking-[-0.6px]"
        style={{
          fontFamily: commerceTypography.headline7.fontFamily,
          color: commerceColors.text.primary,
        }}
      >
        Reviews {reviewCount}
      </h2>
      <div className="flex flex-wrap items-center gap-3 sm:justify-end">
        <RatingStars
          value={reviewCount > 0 ? averageRating : 0}
          size="figmaLg"
          palette="product"
          aria-label={
            reviewCount > 0
              ? `평균 평점 ${averageRating}점`
              : "아직 평점 없음"
          }
        />
        <span
          className="text-sm leading-5"
          style={{
            fontFamily: commerceTypography.caption2.fontFamily,
            color: commerceColors.text.primary,
          }}
          aria-label={reviewCount > 0 ? `평균 ${averageLabel}점` : "평점 0점"}
        >
          {averageLabel}
        </span>
      </div>
    </header>
  );
}
