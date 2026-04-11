"use client";

import { QUERY_KEYS } from "@/commons/constants/query-keys";
import { RatingStars } from "@/components/commerce/RatingStars/RatingStars";
import { cn } from "@/components/ui";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { useQuery } from "@tanstack/react-query";

type ReviewRow = {
  id: string;
  rating: number;
  content: string | null;
  created_at: string;
};

export type ProductDetailReviewsContentProps = {
  productId: string;
  className?: string;
};

export function ProductDetailReviewsContent({
  productId,
  className,
}: ProductDetailReviewsContentProps) {
  const { data, isPending, isError } = useQuery({
    queryKey: QUERY_KEYS.reviews.listByProduct(productId),
    queryFn: async (): Promise<ReviewRow[]> => {
      const supabase = getSupabaseBrowserClient();
      const { data: rows, error } = await supabase
        .from("reviews")
        .select("id, rating, content, created_at")
        .eq("product_id", productId)
        .order("created_at", { ascending: false });

      if (error) throw new Error(`Failed to load reviews: ${error.message}`);
      return (rows ?? []) as ReviewRow[];
    },
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

  return (
    <ul className={cn("flex flex-col gap-6", className)}>
      {list.map((r) => (
        <li
          key={r.id}
          className="border-b border-(--commerce-border-subtle) pb-6 last:border-b-0 last:pb-0"
        >
          <div className="flex flex-wrap items-center gap-2">
            <RatingStars
              value={r.rating}
              size="sm"
              aria-label={`Rating ${r.rating} out of 5`}
            />
            <time
              dateTime={r.created_at}
              className="text-sm text-(--commerce-text-tertiary)"
            >
              {new Date(r.created_at).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </time>
          </div>
          {r.content?.trim() ? (
            <p className="mt-3 whitespace-pre-wrap text-(--commerce-text-primary)">
              {r.content}
            </p>
          ) : (
            <p className="mt-3 text-(--commerce-text-tertiary)">No written review.</p>
          )}
        </li>
      ))}
    </ul>
  );
}
