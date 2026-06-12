"use client";

// 요약 표시, 신뢰도, 재생성, Diff 승인/거부 흐름을 한 박스 안에서 묶어 관리합니다.
import { replaceAiReviewSummary } from "@/app/(commerce)/products/[productId]/review-summary-actions";
import { ReviewSummaryConfidence } from "@/components/commerce/product/ReviewSummaryConfidence";
import { ReviewSummaryDiff } from "@/components/commerce/product/ReviewSummaryDiff";
import { RetryReviewSummaryButton } from "@/components/commerce/product/RetryReviewSummaryButton";
import { ReviewSummaryDisplay } from "@/components/commerce/product/ReviewSummaryDisplay";
import type { ReviewSummaryResult } from "@/lib/ai/review-summary";
import { useRouter } from "next/navigation";
import { useCallback, useState, useTransition } from "react";
import toast from "react-hot-toast";

// 이전 요약과 새 요약이 얼마나 비슷한지 대략적인 안정성 지표로 환산합니다.
function estimateSummaryStability(
  previousSummary: ReviewSummaryResult | null,
  currentSummary: ReviewSummaryResult | null,
): number {
  if (!previousSummary || !currentSummary) {
    return currentSummary ? 1 : 0;
  }

  const prev = new Set(
    `${previousSummary.summary} ${previousSummary.keywords.join(" ")} ${previousSummary.positive_points.join(" ")} ${previousSummary.negative_points.join(" ")}`.split(
      /\s+/,
    ),
  );
  const next = new Set(
    `${currentSummary.summary} ${currentSummary.keywords.join(" ")} ${currentSummary.positive_points.join(" ")} ${currentSummary.negative_points.join(" ")}`.split(
      /\s+/,
    ),
  );
  const intersection = [...prev].filter((word) => next.has(word)).length;
  const union = new Set([...prev, ...next]).size;
  if (union === 0) return 0;
  return intersection / union;
}

export type EnhancedReviewSummaryProps = {
  productId: string;
  isAdmin: boolean;
  initialSummary: ReviewSummaryResult | null;
  reviewCount: number;
  ratingVariance: number;
  averageReviewLength: number;
  summaryStability: number;
};

// 페이지에서 받은 초기 요약과 관리자 액션 상태를 한 곳에서 묶어 관리합니다.
export function EnhancedReviewSummary({
  productId,
  isAdmin,
  initialSummary,
  reviewCount,
  ratingVariance,
  averageReviewLength,
  summaryStability,
}: EnhancedReviewSummaryProps) {
  const router = useRouter();
  const [isRejecting, startRejectTransition] = useTransition();
  const [currentSummary, setCurrentSummary] =
    useState<ReviewSummaryResult | null>(initialSummary);
  const [previousSummary, setPreviousSummary] =
    useState<ReviewSummaryResult | null>(null);
  const [currentStability, setCurrentStability] = useState(summaryStability);
  const [diffVersion, setDiffVersion] = useState(0);

  // 재생성 성공 직후, Diff 패널이 비교할 수 있도록 두 요약을 함께 저장합니다.
  const handleRegenerated = useCallback(
    (payload: {
      summary: ReviewSummaryResult;
      previousSummary: ReviewSummaryResult | null;
    }) => {
      setPreviousSummary(payload.previousSummary);
      setCurrentSummary(payload.summary);
      setDiffVersion((value) => value + 1);
      setCurrentStability(
        estimateSummaryStability(payload.previousSummary, payload.summary),
      );
    },
    [],
  );

  const handleApprove = useCallback(() => {
    // 승인은 현재 요약을 그대로 채택하는 동작이라 비교 상태만 정리합니다.
    setPreviousSummary(null);
    setCurrentStability(1);
    toast.success("새 요약을 승인했습니다.");
    router.refresh();
  }, [router]);

  const handleReject = useCallback(() => {
    if (!previousSummary) return;

    startRejectTransition(async () => {
      // 거부 시 서버에 이전 요약을 다시 저장해 실제 표시값도 함께 되돌립니다.
      const result = await replaceAiReviewSummary(productId, previousSummary);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }

      setCurrentSummary(previousSummary);
      setPreviousSummary(null);
      setCurrentStability(1);
      toast.success("이전 요약으로 되돌렸습니다.");
      router.refresh();
    });
  }, [previousSummary, productId, router]);

  return (
    <section className="rounded-lg border border-(--commerce-border-subtle) bg-(--commerce-background-light)/80 p-6 shadow-sm">
      <ReviewSummaryDisplay
        productId={productId}
        initialData={currentSummary}
        onSummaryChange={setCurrentSummary}
        className="border-0 bg-transparent p-0 shadow-none"
      />

      <div className="mt-5 grid gap-4 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <ReviewSummaryConfidence
          reviewCount={reviewCount}
          ratingVariance={ratingVariance}
          averageReviewLength={averageReviewLength}
          summaryStability={currentStability}
        />
        <div className="rounded-xl border border-(--commerce-border-subtle) bg-(--commerce-background-paper) p-4">
          <h4
            className="text-sm font-semibold text-(--commerce-text-primary)"
            style={{ fontFamily: "var(--commerce-font-heading)" }}
          >
            재시도 관리
          </h4>
          <p
            className="mt-1 text-xs text-(--commerce-text-secondary)"
            style={{ fontFamily: "var(--commerce-font-body)" }}
          >
            에러 이력과 연속 실패 상태를 함께 확인합니다.
          </p>
          <div className="mt-4">
            <RetryReviewSummaryButton
              isAdmin={isAdmin}
              productId={productId}
              onRegenerated={handleRegenerated}
            />
          </div>
        </div>
      </div>

      <div className="mt-4">
        <ReviewSummaryDiff
          previousSummary={previousSummary}
          currentSummary={currentSummary}
          onApprove={handleApprove}
          onReject={handleReject}
          autoOpenToken={diffVersion}
        />
      </div>

      {isRejecting ? (
        <p
          className="mt-3 text-sm text-(--commerce-text-secondary)"
          style={{ fontFamily: "var(--commerce-font-body)" }}
        >
          이전 요약으로 복구하는 중…
        </p>
      ) : null}
    </section>
  );
}
