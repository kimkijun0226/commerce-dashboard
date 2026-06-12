"use client";

// 리뷰 탭 안에서 통계, 작성 UI, 로그인 안내, 서버에서 내려준 요약/목록 슬롯을 조합합니다.
import { CustomerReviewsHeader } from "@/app/(commerce)/products/[productId]/_components/CustomerReviewsHeader";
import { ReviewFeedbackBar } from "@/app/(commerce)/products/[productId]/_components/ReviewFeedbackBar";
import type { ReviewWriteEligibility } from "@/app/(commerce)/products/[productId]/review-actions";
import { useAuth } from "@/commons/hooks/useAuth";
import { commerceColors } from "@/commons/constants/color";
import { Button, cn } from "@/components/ui";
import { useProductReviews } from "@/features/products/hooks/useProductReviews";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useCallback, useEffect, useState } from "react";

export type ProductReviewsSectionProps = {
  productId: string;
  reviewWriteEligibility: ReviewWriteEligibility;
  /** URL `?openReview=1` 등으로 들어올 때 작성 폼을 바로 펼침 */
  initialComposerOpen?: boolean;
  /** URL `orderId=` — 해당 주문에 리뷰 연결 */
  initialReviewOrderId?: string | null;
  reviewSummarySection?: ReactNode;
  reviewListSection?: ReactNode;
  className?: string;
};

// 리뷰 탭 내부의 작성 흐름과 서버 슬롯을 연결하는 상위 섹션입니다.
export function ProductReviewsSection({
  productId,
  reviewWriteEligibility,
  initialComposerOpen = false,
  initialReviewOrderId = null,
  reviewSummarySection,
  reviewListSection,
  className,
}: ProductReviewsSectionProps) {
  const router = useRouter();
  const productPath = `/products/${encodeURIComponent(productId)}`;

  const { userId: authUserId, isLoading: authLoading } = useAuth();

  const [showComposer, setShowComposer] = useState(!!initialComposerOpen);

  // 작성 링크용 쿼리를 정리할 때는 현재 상품 경로만 남기고 교체합니다.
  const clearReviewUrlAndRefresh = useCallback(() => {
    router.replace(productPath, { scroll: false });
  }, [productPath, router]);

  /** 제출 후 `openReview` 등은 지우되, 리뷰 탭은 유지 (`?tab=reviews`) */
  const afterReviewSubmitted = useCallback(() => {
    setShowComposer(false);
    const withReviewsTab = `${productPath}?tab=reviews&aiRefreshing=1`;
    router.replace(withReviewsTab, { scroll: false });
  }, [productPath, router]);

  const cancelComposer = useCallback(() => {
    setShowComposer(false);
    if (initialComposerOpen || initialReviewOrderId) {
      clearReviewUrlAndRefresh();
    }
  }, [clearReviewUrlAndRefresh, initialComposerOpen, initialReviewOrderId]);

  useEffect(() => {
    queueMicrotask(() => {
      setShowComposer(!!initialComposerOpen);
    });
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

  const isLoggedIn = !authLoading && !!authUserId;

  const summaryStatsLoading = summaryPending && !summarySuccess;

  return (
    <div className={cn("flex w-full max-w-[1120px] flex-col", className)}>
      <div className="flex flex-col gap-6">
        {summaryError ? (
          <p
            role="alert"
            style={{
              fontFamily: "var(--commerce-font-body)",
              color: commerceColors.text.muted,
            }}
          >
            리뷰 통계를 불러오지 못했습니다.
          </p>
        ) : summaryStatsLoading ? (
          <p
            style={{
              fontFamily: "var(--commerce-font-body)",
              color: commerceColors.text.muted,
            }}
          >
            리뷰 통계를 불러오는 중…
          </p>
        ) : (
          <CustomerReviewsHeader
            averageRating={averageRating}
            reviewCount={reviewCount}
          />
        )}
        {reviewSummarySection ? (
          <div className="flex flex-col gap-3">{reviewSummarySection}</div>
        ) : null}
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
        {reviewListSection}
      </div>
    </div>
  );
}
