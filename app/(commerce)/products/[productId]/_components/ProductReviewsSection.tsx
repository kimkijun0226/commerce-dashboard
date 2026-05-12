"use client";

import { CustomerReviewsHeader } from "@/app/(commerce)/products/[productId]/_components/CustomerReviewsHeader";
import { ReviewFeedbackBar } from "@/app/(commerce)/products/[productId]/_components/ReviewFeedbackBar";
import { ReviewList } from "@/app/(commerce)/products/[productId]/_components/ReviewList";
import type { ReviewWriteEligibility } from "@/app/(commerce)/products/[productId]/review-actions";
import { useAuth } from "@/commons/hooks/useAuth";
import { commerceColors } from "@/commons/constants/color";
import { Button, cn } from "@/components/ui";
import { useProductReviews } from "@/features/products/hooks/useProductReviews";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

export type ProductReviewsSectionProps = {
  productId: string;
  reviewWriteEligibility: ReviewWriteEligibility;
  /** URL `?openReview=1` 등으로 들어올 때 작성 폼을 바로 펼침 */
  initialComposerOpen?: boolean;
  /** URL `orderId=` — 해당 주문에 리뷰 연결 */
  initialReviewOrderId?: string | null;
  isSuperAdmin?: boolean;
  className?: string;
};

export function ProductReviewsSection({
  productId,
  reviewWriteEligibility,
  initialComposerOpen = false,
  initialReviewOrderId = null,
  isSuperAdmin,
  className,
}: ProductReviewsSectionProps) {
  const router = useRouter();
  const productPath = `/products/${encodeURIComponent(productId)}`;

  const { userId: authUserId, isLoading: authLoading } = useAuth();
  const effectiveUserId = authUserId ?? null;

  const [showComposer, setShowComposer] = useState(!!initialComposerOpen);

  const clearReviewUrlAndRefresh = useCallback(() => {
    router.replace(productPath, { scroll: false });
    router.refresh();
  }, [productPath, router]);

  const afterReviewSubmitted = useCallback(() => {
    setShowComposer(false);
    clearReviewUrlAndRefresh();
  }, [clearReviewUrlAndRefresh]);

  const cancelComposer = useCallback(() => {
    setShowComposer(false);
    if (initialComposerOpen || initialReviewOrderId) {
      clearReviewUrlAndRefresh();
    }
  }, [clearReviewUrlAndRefresh, initialComposerOpen, initialReviewOrderId]);

  useEffect(() => {
    setShowComposer(!!initialComposerOpen);
  }, [initialComposerOpen, productId]);

  const closeComposer = cancelComposer;

  const {
    reviewCount,
    averageFromReviews,
    isPending: summaryPending,
    isError: summaryError,
    isSuccess: summarySuccess,
  } = useProductReviews(productId);

  const averageRating =
    summarySuccess && reviewCount > 0
      ? Math.round(averageFromReviews * 10) / 10
      : 0;

  const isLoggedIn = !authLoading && !!effectiveUserId;

  if (summaryError) {
    return (
      <p
        className={cn(className)}
        role="alert"
        style={{
          fontFamily: "var(--commerce-font-body)",
          color: commerceColors.text.muted,
        }}
      >
        리뷰 요약을 불러오지 못했습니다.
      </p>
    );
  }

  if (summaryPending && !summarySuccess) {
    return (
      <p
        className={cn(className)}
        style={{
          fontFamily: "var(--commerce-font-body)",
          color: commerceColors.text.muted,
        }}
      >
        리뷰 요약을 불러오는 중…
      </p>
    );
  }

  return (
    <div className={cn("flex w-full max-w-[1120px] flex-col", className)}>
      <div className="flex flex-col gap-6">
        <CustomerReviewsHeader
          averageRating={averageRating}
          reviewCount={reviewCount}
        />
      </div>

      <div className="mt-6 flex flex-col gap-6">
        {authLoading ? (
          <p
            className="text-sm"
            style={{
              fontFamily: "var(--commerce-font-body)",
              color: commerceColors.text.muted,
            }}
          >
            로그인 여부 확인 중…
          </p>
        ) : isLoggedIn && reviewWriteEligibility.canCreate ? (
          showComposer ? (
            <div className="flex flex-col gap-3">
              <ReviewFeedbackBar
                productId={productId}
                orderId={initialReviewOrderId}
                onSuccess={afterReviewSubmitted}
              />
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={closeComposer}
                  className="text-sm font-medium text-(--commerce-text-secondary) underline-offset-2 hover:text-(--commerce-text-primary) hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--commerce-semantic-info)"
                  style={{ fontFamily: "var(--commerce-font-body)" }}
                >
                  작성 취소
                </button>
              </div>
            </div>
          ) : (
            <div
              className="flex flex-wrap items-center justify-between gap-2 rounded-md border px-3 py-2.5 sm:px-4"
              style={{
                fontFamily: "var(--commerce-font-body)",
                borderColor: commerceColors.border.subtle,
                backgroundColor: commerceColors.background.paper,
              }}
            >
              <p
                className="min-w-0 text-sm font-medium leading-snug text-(--commerce-text-primary)"
                style={{ color: commerceColors.text.primary }}
              >
                이 상품의 상품평을 작성해 주세요.
              </p>
              <Button
                type="button"
                variant="primary"
                size="sm"
                className="shrink-0 rounded-full px-4 !min-h-8 text-xs font-semibold sm:text-sm"
                onClick={() => setShowComposer(true)}
              >
                상품평 작성
              </Button>
            </div>
          )
        ) : null}

        {!isLoggedIn && !authLoading ? (
          <div
            className="rounded-2xl border px-6 py-5 shadow-sm"
            style={{
              fontFamily: "var(--commerce-font-body)",
              borderColor: commerceColors.border.subtle,
              backgroundColor: commerceColors.background.paper,
            }}
          >
            <p
              className="text-base leading-[26px]"
              style={{ color: commerceColors.text.muted }}
            >
              로그인하시면 상품평을 남길 수 있어요.
            </p>
            <Link
              href={`/login?next=/products/${encodeURIComponent(productId)}`}
              className="mt-4 inline-flex h-10 min-w-[176px] items-center justify-center rounded-full px-8 text-base font-medium leading-7 tracking-[-0.4px] text-white transition-opacity hover:opacity-90"
              style={{ backgroundColor: commerceColors.primary.main }}
            >
              Sign in
            </Link>
          </div>
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
