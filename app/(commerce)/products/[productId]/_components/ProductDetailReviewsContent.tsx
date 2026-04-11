"use client";

import { QUERY_KEYS } from "@/commons/constants/query-keys";
import { RatingStars } from "@/components/commerce/RatingStars/RatingStars";
import { cn } from "@/components/ui";
import type { ProductReviewListItem } from "@/features/reviews/api/getProductReviews";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { useQuery } from "@tanstack/react-query";

export type ProductDetailReviewsContentProps = {
  productId: string;
  initialReviews: ProductReviewListItem[];
  className?: string;
};

export function ProductDetailReviewsContent({
  productId,
  initialReviews,
  className,
}: ProductDetailReviewsContentProps) {
  const { data, isPending, isError } = useQuery({
    queryKey: QUERY_KEYS.reviews.listByProduct(productId),
    queryFn: async (): Promise<ProductReviewListItem[]> => {
      const supabase = getSupabaseBrowserClient();
      const { data: rows, error } = await supabase
        .from("reviews")
        .select("id, rating, content, created_at")
        .eq("product_id", productId)
        .order("created_at", { ascending: false });

      if (error) throw new Error(`Failed to load reviews: ${error.message}`);
      return (rows ?? []) as ProductReviewListItem[];
    },
    initialData: initialReviews,
    staleTime: 60 * 1000,
  });

  if (isPending) {
    return (
      <p className={cn("text-(--commerce-text-tertiary)", className)}>
        Loading reviews…
      </p>
    );
  }

  if (isError) {
    return (
      <p className={cn("text-(--commerce-text-tertiary)", className)} role="alert">
        Could not load reviews.
      </p>
    );
  }

  const list = data ?? [];
  if (list.length === 0) {
    return (
      <p className={cn("text-(--commerce-text-tertiary)", className)}>
        No reviews yet.
      </p>
    );
  }

  const sumRating = list.reduce((acc, r) => acc + r.rating, 0);
  const averageRating =
    list.length > 0 ? Math.round((sumRating / list.length) * 10) / 10 : 0;

  return (
    <div className={cn("w-full", className)}>
      <div className="mb-8 flex flex-col gap-4 border-b border-(--commerce-border-subtle) pb-8 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
        <div className="flex flex-wrap items-center gap-4">
          <span
            className="text-[32px] font-medium leading-none tabular-nums tracking-[-0.02em] text-(--commerce-text-primary) sm:text-[36px]"
            style={{ fontFamily: "var(--commerce-font-heading)" }}
          >
            {averageRating.toFixed(1)}
          </span>
          <div className="flex flex-col gap-1">
            <RatingStars
              value={averageRating}
              size="md"
              aria-label={`Average rating ${averageRating} out of 5`}
            />
            <span
              className="text-xs text-(--commerce-text-secondary) sm:text-sm"
              style={{ fontFamily: "var(--commerce-font-body)" }}
            >
              Based on {list.length}{" "}
              {list.length === 1 ? "review" : "reviews"}
            </span>
          </div>
        </div>
      </div>

      <ul className="flex flex-col gap-4">
        {list.map((r) => (
          <li
            key={r.id}
            className="rounded-lg border border-(--commerce-border-subtle) bg-(--commerce-background-default) p-4 sm:p-5"
          >
            <div className="flex items-start justify-between gap-3">
              <RatingStars
                value={r.rating}
                size="sm"
                aria-label={`Rating ${r.rating} out of 5`}
              />
              <time
                dateTime={r.created_at}
                className="shrink-0 text-xs text-(--commerce-text-tertiary) sm:text-sm"
                style={{ fontFamily: "var(--commerce-font-body)" }}
              >
                {new Date(r.created_at).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </time>
            </div>
            {r.content?.trim() ? (
              <p
                className="mt-3 text-[15px] leading-relaxed text-(--commerce-text-primary) sm:text-base sm:leading-7"
                style={{ fontFamily: "var(--commerce-font-body)" }}
              >
                {r.content}
              </p>
            ) : (
              <p
                className="mt-3 text-sm text-(--commerce-text-tertiary)"
                style={{ fontFamily: "var(--commerce-font-body)" }}
              >
                No written review.
              </p>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
