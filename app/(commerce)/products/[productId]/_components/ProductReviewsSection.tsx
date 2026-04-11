"use client";

import { CustomerReviewsHeader } from "@/app/(commerce)/products/[productId]/_components/CustomerReviewsHeader";
import { ReviewFeedbackBar } from "@/app/(commerce)/products/[productId]/_components/ReviewFeedbackBar";
import { ReviewList } from "@/app/(commerce)/products/[productId]/_components/ReviewList";
import { ReviewSummaryDisplay } from "@/app/(commerce)/products/[productId]/_components/ReviewSummaryDisplay";
import { QUERY_KEYS } from "@/commons/constants/query-keys";
import { useAuth } from "@/commons/hooks/useAuth";
import { ReviewForm } from "@/components/commerce/ReviewForm";
import { cn } from "@/components/ui";
import { useProductReviews } from "@/features/products/hooks/useProductReviews";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

export type ProductReviewsSectionProps = {
  productId: string;
  isSuperAdmin?: boolean;
  className?: string;
};

export function ProductReviewsSection({
  productId,
  isSuperAdmin,
  className,
}: ProductReviewsSectionProps) {
  const { userId: authUserId, isLoading: authLoading } = useAuth();
  const effectiveUserId = authUserId ?? null;
  const queryClient = useQueryClient();
  const [formKey, setFormKey] = useState(0);
  const [draftRating, setDraftRating] = useState(5);
  const [showFullForm, setShowFullForm] = useState(false);

  const {
    reviewCount,
    averageFromReviews,
    isPending: summaryPending,
    isError: summaryError,
    isSuccess: summarySuccess,
  } = useProductReviews(productId);

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
        queryKey: ["reviews", "page", productId],
      });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.reviews.byProduct(productId),
      });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.reviews.listByProduct(productId),
      });
      setFormKey((k) => k + 1);
      setShowFullForm(false);
      toast.success("리뷰가 등록되었습니다.");
    },
    onError: (e: Error) => {
      toast.error(e.message || "리뷰를 등록하지 못했습니다.");
    },
  });

  const averageRating =
    summarySuccess && reviewCount > 0
      ? Math.round(averageFromReviews * 10) / 10
      : 0;

  const isLoggedIn = !authLoading && !!effectiveUserId;

  if (summaryError) {
    return (
      <p
        className={cn("text-[#99a1af]", className)}
        role="alert"
        style={{ fontFamily: "var(--commerce-font-body)" }}
      >
        리뷰 요약을 불러오지 못했습니다.
      </p>
    );
  }

  if (summaryPending && !summarySuccess) {
    return (
      <p
        className={cn("text-[#99a1af]", className)}
        style={{ fontFamily: "var(--commerce-font-body)" }}
      >
        리뷰 요약을 불러오는 중…
      </p>
    );
  }

  return (
    <div className={cn("flex w-full max-w-[1120px] flex-col", className)}>
      <div className="flex flex-col gap-10">
        <ReviewSummaryDisplay />
        <CustomerReviewsHeader
          averageRating={averageRating}
          reviewCount={reviewCount}
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
          productId={productId}
          currentUserId={effectiveUserId}
          isSuperAdmin={isSuperAdmin}
        />
      </div>
    </div>
  );
}
