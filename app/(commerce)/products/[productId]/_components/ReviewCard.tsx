"use client";

import { reviewDisplayName } from "@/app/(commerce)/products/[productId]/_components/reviewDisplayName";
import { RatingStars } from "@/components/commerce/RatingStars/RatingStars";
import { cn } from "@/components/ui";
import type { ProductReviewListItem } from "@/features/reviews/api/getProductReviews";

export type ReviewCardProps = {
  review: ProductReviewListItem;
  isSuperAdmin?: boolean;
  className?: string;
};

/** Figma user 코멘트 카드 (48:8904): 72 아바타 + 이름·별·본문, 하단 보더 #e8ecef */
export function ReviewCard({
  review,
  isSuperAdmin,
  className,
}: ReviewCardProps) {
  const name = reviewDisplayName(review.id);

  return (
    <article
      className={cn(
        "flex gap-10 border-b border-[#e8ecef] pb-10 last:border-b-0 last:pb-0",
        className,
      )}
    >
      <div
        className="size-[72px] shrink-0 rounded-full bg-[#f3f5f7]"
        aria-hidden
      />
      <div className="min-w-0 flex-1">
        <div className="flex flex-col gap-4">
          <p
            className="text-xl font-semibold leading-8 text-[#141718]"
            style={{ fontFamily: "var(--commerce-font-body)" }}
          >
            {name}
          </p>
          <RatingStars
            value={review.rating}
            size="figma"
            palette="product"
            aria-label={`Rating ${review.rating} out of 5`}
          />
        </div>
        {isSuperAdmin ? (
          <p className="mt-2 text-xs text-(--commerce-semantic-info)">
            Admin view
          </p>
        ) : null}
        {review.content?.trim() ? (
          <p
            className="mt-4 text-base leading-[26px] text-[#353945]"
            style={{ fontFamily: "var(--commerce-font-body)" }}
          >
            {review.content}
          </p>
        ) : (
          <p
            className="mt-4 text-base leading-[26px] text-[#99a1af]"
            style={{ fontFamily: "var(--commerce-font-body)" }}
          >
            No written review.
          </p>
        )}
      </div>
    </article>
  );
}
