"use client";

import { RatingStars } from "@/components/commerce/RatingStars/RatingStars";
import { cn } from "@/components/ui";
import type { ProductReviewListItem } from "@/features/reviews/api/getProductReviews";

export type ReviewCardProps = {
  review: ProductReviewListItem;
  isSuperAdmin?: boolean;
  className?: string;
};

export function ReviewCard({
  review,
  isSuperAdmin,
  className,
}: ReviewCardProps) {
  return (
    <article
      className={cn(
        "rounded-lg border border-(--commerce-border-subtle) bg-(--commerce-background-default) p-4 sm:p-5",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <RatingStars
          value={review.rating}
          size="sm"
          aria-label={`Rating ${review.rating} out of 5`}
        />
        <time
          dateTime={review.created_at}
          className="shrink-0 text-xs text-(--commerce-text-tertiary) sm:text-sm"
          style={{ fontFamily: "var(--commerce-font-body)" }}
        >
          {new Date(review.created_at).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
        </time>
      </div>
      {isSuperAdmin ? (
        <p className="mt-1 text-xs text-(--commerce-semantic-info)">
          Admin view
        </p>
      ) : null}
      {review.content?.trim() ? (
        <p
          className="mt-3 text-[15px] leading-relaxed text-(--commerce-text-primary) sm:text-base sm:leading-7"
          style={{ fontFamily: "var(--commerce-font-body)" }}
        >
          {review.content}
        </p>
      ) : (
        <p
          className="mt-3 text-sm text-(--commerce-text-tertiary)"
          style={{ fontFamily: "var(--commerce-font-body)" }}
        >
          No written review.
        </p>
      )}
    </article>
  );
}
