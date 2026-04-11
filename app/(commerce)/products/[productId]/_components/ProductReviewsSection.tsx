"use client";

import { CustomerReviewsHeader } from "@/app/(commerce)/products/[productId]/_components/CustomerReviewsHeader";
import { ReviewList } from "@/app/(commerce)/products/[productId]/_components/ReviewList";
import { ReviewSummaryDisplay } from "@/app/(commerce)/products/[productId]/_components/ReviewSummaryDisplay";
import { QUERY_KEYS } from "@/commons/constants/query-keys";
import { useAuth } from "@/commons/hooks/useAuth";
import { ReviewForm } from "@/components/commerce/ReviewForm";
import { cn } from "@/components/ui";
import type { ProductReviewListItem } from "@/features/reviews/api/getProductReviews";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

export type ProductReviewsSectionProps = {
  productId: string;
  initialReviews: ProductReviewListItem[];
  currentUserId?: string | null;
  isSuperAdmin?: boolean;
  className?: string;
};

export function ProductReviewsSection({
  productId,
  initialReviews,
  currentUserId,
  isSuperAdmin,
  className,
}: ProductReviewsSectionProps) {
  const { userId: authUserId, isLoading: authLoading } = useAuth();
  const effectiveUserId = currentUserId ?? authUserId ?? null;
  const queryClient = useQueryClient();
  const [formKey, setFormKey] = useState(0);

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

  const mutation = useMutation({
    mutationFn: async (payload: { rating: number; body: string }) => {
      if (!effectiveUserId) throw new Error("Not signed in");
      const supabase = getSupabaseBrowserClient();
      const { error } = await supabase.from("reviews").insert({
        user_id: effectiveUserId,
        product_id: productId,
        rating: payload.rating,
        content: payload.body || null,
      });
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.reviews.listByProduct(productId),
      });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.reviews.byProduct(productId),
      });
      setFormKey((k) => k + 1);
      toast.success("Review submitted.");
    },
    onError: (e: Error) => {
      toast.error(e.message || "Could not submit review.");
    },
  });

  const list = data ?? [];
  const sumRating = list.reduce((acc, r) => acc + r.rating, 0);
  const averageRating =
    list.length > 0 ? Math.round((sumRating / list.length) * 10) / 10 : 0;

  if (isPending && list.length === 0 && !initialReviews.length) {
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

  return (
    <div className={cn("flex w-full flex-col gap-8", className)}>
      <ReviewSummaryDisplay />
      <CustomerReviewsHeader
        averageRating={averageRating}
        reviewCount={list.length}
      />

      <div className="flex flex-col gap-4">
        {authLoading ? (
          <p
            className="text-sm text-(--commerce-text-tertiary)"
            style={{ fontFamily: "var(--commerce-font-body)" }}
          >
            Checking session…
          </p>
        ) : effectiveUserId ? (
          <ReviewForm
            key={formKey}
            disabled={mutation.isPending}
            onSubmit={(values) =>
              mutation.mutate({ rating: values.rating, body: values.body })
            }
          />
        ) : (
          <div
            className="flex flex-col gap-3 rounded-xl border border-(--commerce-border-subtle) bg-(--commerce-background-paper) p-4 sm:p-5"
            style={{ fontFamily: "var(--commerce-font-body)" }}
          >
            <p className="text-sm text-(--commerce-text-secondary)">
              Sign in to write a review for this product.
            </p>
            <Link
              href="/login"
              className={cn(
                "inline-flex min-h-10 w-fit items-center justify-center rounded-lg px-4 text-sm font-medium",
                "bg-(--commerce-primary-main) text-(--commerce-text-inverse)",
                "transition-colors hover:opacity-90",
                "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--commerce-semantic-info)",
              )}
            >
              Sign in
            </Link>
          </div>
        )}
      </div>

      <ReviewList reviews={list} isSuperAdmin={isSuperAdmin} />
    </div>
  );
}
