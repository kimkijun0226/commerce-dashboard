"use client";

import { CustomerReviewsHeader } from "@/app/(commerce)/products/[productId]/_components/CustomerReviewsHeader";
import { ReviewFeedbackBar } from "@/app/(commerce)/products/[productId]/_components/ReviewFeedbackBar";
import { ReviewList } from "@/app/(commerce)/products/[productId]/_components/ReviewList";
import { ReviewSummaryDisplay } from "@/app/(commerce)/products/[productId]/_components/ReviewSummaryDisplay";
import {
  type ReviewSortOption,
  sortReviewsByOption,
} from "@/app/(commerce)/products/[productId]/_components/reviewSort";
import { QUERY_KEYS } from "@/commons/constants/query-keys";
import { useAuth } from "@/commons/hooks/useAuth";
import { ReviewForm } from "@/components/commerce/ReviewForm";
import { cn } from "@/components/ui";
import type { ProductReviewListItem } from "@/features/reviews/api/getProductReviews";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
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
  const [draftRating, setDraftRating] = useState(5);
  const [showFullForm, setShowFullForm] = useState(false);
  const [sort, setSort] = useState<ReviewSortOption>("newest");

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
      if (!effectiveUserId) throw new Error("로그인이 필요합니다.");
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
      setShowFullForm(false);
      toast.success("리뷰가 등록되었습니다.");
    },
    onError: (e: Error) => {
      toast.error(e.message || "리뷰를 등록하지 못했습니다.");
    },
  });

  const list = data ?? [];
  const sortedList = useMemo(
    () => sortReviewsByOption(list, sort),
    [list, sort],
  );

  const sumRating = list.reduce((acc, r) => acc + r.rating, 0);
  const averageRating =
    list.length > 0 ? Math.round((sumRating / list.length) * 10) / 10 : 0;

  const isLoggedIn = !authLoading && !!effectiveUserId;

  if (isPending && list.length === 0 && !initialReviews.length) {
    return (
      <p className={cn("text-[#99a1af]", className)} style={{ fontFamily: "var(--commerce-font-body)" }}>
        리뷰를 불러오는 중…
      </p>
    );
  }

  if (isError) {
    return (
      <p className={cn("text-[#99a1af]", className)} role="alert" style={{ fontFamily: "var(--commerce-font-body)" }}>
        리뷰를 불러오지 못했습니다.
      </p>
    );
  }

  return (
    <div className={cn("flex w-full max-w-[1120px] flex-col", className)}>
      <div className="flex flex-col gap-10">
        <ReviewSummaryDisplay />
        <CustomerReviewsHeader
          averageRating={averageRating}
          reviewCount={list.length}
        />
      </div>

      <div className="mt-16 flex flex-col gap-10">
        {authLoading ? (
          <p
            className="text-sm text-[#99a1af]"
            style={{ fontFamily: "var(--commerce-font-body)" }}
          >
            로그인 여부 확인 중…
          </p>
        ) : (
          <ReviewFeedbackBar
            isLoggedIn={isLoggedIn}
            draftRating={draftRating}
            onDraftRatingChange={setDraftRating}
            onWriteReviewClick={() => setShowFullForm(true)}
          />
        )}

        {isLoggedIn && showFullForm ? (
          <ReviewForm
            key={formKey}
            initialValues={{ rating: draftRating }}
            disabled={mutation.isPending}
            onSubmit={(values) =>
              mutation.mutate({
                rating: values.rating,
                body: values.body,
              })
            }
            className="rounded-2xl border border-[#e8ecef] bg-[#fefefe] shadow-sm"
          />
        ) : null}
      </div>

      <div className="mt-10">
        <ReviewList
          reviews={sortedList}
          isSuperAdmin={isSuperAdmin}
          sort={sort}
          onSortChange={setSort}
        />
      </div>
    </div>
  );
}
