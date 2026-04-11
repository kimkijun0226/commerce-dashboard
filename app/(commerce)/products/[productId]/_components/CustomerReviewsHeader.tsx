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
    <header
      className={cn(
        "flex flex-col gap-4 border-b border-(--commerce-border-subtle) pb-6 sm:flex-row sm:items-center sm:justify-between sm:gap-6",
        className,
      )}
    >
      <h2
        className="text-xl font-medium tracking-tight text-(--commerce-text-primary) sm:text-2xl"
        style={{ fontFamily: "var(--commerce-font-heading)" }}
      >
        Customer Reviews
      </h2>
      <div className="flex flex-wrap items-center gap-4">
        <span
          className="text-[28px] font-medium leading-none tabular-nums text-(--commerce-text-primary) sm:text-[32px]"
          style={{ fontFamily: "var(--commerce-font-heading)" }}
        >
          {reviewCount > 0 ? averageRating.toFixed(1) : "—"}
        </span>
        <div className="flex flex-col gap-1">
          <RatingStars
            value={reviewCount > 0 ? averageRating : 0}
            size="md"
            aria-label={
              reviewCount > 0
                ? `Average rating ${averageRating} out of 5`
                : "No ratings yet"
            }
          />
          <span
            className="text-xs text-(--commerce-text-secondary) sm:text-sm"
            style={{ fontFamily: "var(--commerce-font-body)" }}
          >
            {reviewCount}{" "}
            {reviewCount === 1 ? "review" : "reviews"}
          </span>
        </div>
      </div>
    </header>
  );
}
