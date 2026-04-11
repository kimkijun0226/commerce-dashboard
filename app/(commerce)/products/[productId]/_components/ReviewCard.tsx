"use client";

import {
  reviewDisplayInitials,
  reviewDisplayName,
} from "@/app/(commerce)/products/[productId]/_components/reviewDisplayName";
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
  const name = reviewDisplayName(review.id);
  const initials = reviewDisplayInitials(name);

  return (
    <article
      className={cn("flex gap-8 sm:gap-10", className)}
    >
      <div
        className={cn(
          "flex size-[72px] shrink-0 items-center justify-center rounded-full",
          "border border-[#e8ecef] bg-[#f3f5f7]",
          "text-lg font-semibold tracking-tight text-[#6c7275]",
        )}
        aria-hidden
        style={{ fontFamily: "var(--commerce-font-body)" }}
      >
        {initials}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-col gap-3">
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
            aria-label={`평점 ${review.rating}점 만점 5점`}
          />
        </div>
        {isSuperAdmin ? (
          <p className="mt-2 text-xs text-(--commerce-semantic-info)">
            관리자 보기
          </p>
        ) : null}
        {review.content?.trim() ? (
          <p
            className="mt-5 max-w-[52rem] text-base leading-[26px] text-[#353945]"
            style={{ fontFamily: "var(--commerce-font-body)" }}
          >
            {review.content}
          </p>
        ) : (
          <p
            className="mt-5 text-base leading-[26px] text-[#99a1af]"
            style={{ fontFamily: "var(--commerce-font-body)" }}
          >
            작성된 리뷰 내용이 없습니다.
          </p>
        )}
      </div>
    </article>
  );
}
