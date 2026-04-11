"use client";

import { ReviewCard } from "@/app/(commerce)/products/[productId]/_components/ReviewCard";
import { Button, cn } from "@/components/ui";
import type { ProductReviewListItem } from "@/features/reviews/api/getProductReviews";
import { useState } from "react";

const DEFAULT_PAGE_SIZE = 5;

export type ReviewListProps = {
  reviews: ProductReviewListItem[];
  isSuperAdmin?: boolean;
  pageSize?: number;
  className?: string;
};

export function ReviewList({
  reviews,
  isSuperAdmin,
  pageSize = DEFAULT_PAGE_SIZE,
  className,
}: ReviewListProps) {
  const [visible, setVisible] = useState(pageSize);

  const shown = reviews.slice(0, visible);
  const hasMore = visible < reviews.length;

  if (reviews.length === 0) {
    return (
      <p
        className={cn("text-(--commerce-text-tertiary)", className)}
        style={{ fontFamily: "var(--commerce-font-body)" }}
      >
        No reviews yet.
      </p>
    );
  }

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      <ul className="flex flex-col gap-4" aria-label="Customer reviews">
        {shown.map((r) => (
          <li key={r.id}>
            <ReviewCard review={r} isSuperAdmin={isSuperAdmin} />
          </li>
        ))}
      </ul>
      {hasMore ? (
        <Button
          type="button"
          variant="secondary"
          className="self-center"
          onClick={() => setVisible((v) => v + pageSize)}
        >
          Load more
        </Button>
      ) : null}
    </div>
  );
}
