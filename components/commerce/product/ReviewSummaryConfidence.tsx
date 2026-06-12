"use client";

// AI가 만든 요약을 얼마나 믿어도 되는지 간단한 수치와 상세 지표로 보여줍니다.
import {
  calculateConfidence,
  getConfidenceBreakdown,
  getConfidenceLevel,
} from "@/lib/ai/confidence";
import { useMemo, useState } from "react";

export type ReviewSummaryConfidenceProps = {
  reviewCount: number;
  ratingVariance: number;
  averageReviewLength: number;
  summaryStability: number;
};

const levelStyle = {
  high: {
    label: "높음",
    bar: "bg-emerald-500",
    badge: "border-emerald-200 bg-emerald-50 text-emerald-700",
  },
  medium: {
    label: "보통",
    bar: "bg-amber-500",
    badge: "border-amber-200 bg-amber-50 text-amber-700",
  },
  low: {
    label: "낮음",
    bar: "bg-rose-500",
    badge: "border-rose-200 bg-rose-50 text-rose-700",
  },
} as const;

// 신뢰도 수치, 레벨, 상세 항목 점수를 한 카드에서 보여 줍니다.
export function ReviewSummaryConfidence({
  reviewCount,
  ratingVariance,
  averageReviewLength,
  summaryStability,
}: ReviewSummaryConfidenceProps) {
  const [detailsOpen, setDetailsOpen] = useState(false);

  // 같은 입력값으로 반복 렌더링될 때 불필요한 재계산을 줄입니다.
  const confidence = useMemo(
    () =>
      calculateConfidence({
        reviewCount,
        ratingVariance,
        averageReviewLength,
        summaryStability,
      }),
    [averageReviewLength, ratingVariance, reviewCount, summaryStability],
  );

  const breakdown = useMemo(
    () =>
      getConfidenceBreakdown({
        reviewCount,
        ratingVariance,
        averageReviewLength,
        summaryStability,
      }),
    [averageReviewLength, ratingVariance, reviewCount, summaryStability],
  );

  const level = getConfidenceLevel(confidence);
  const progress = Math.round(confidence * 100);
  const style = levelStyle[level];

  return (
    <section className="rounded-xl border border-(--commerce-border-subtle) bg-(--commerce-background-paper) p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h4
            className="text-sm font-semibold text-(--commerce-text-primary)"
            style={{ fontFamily: "var(--commerce-font-heading)" }}
          >
            요약 신뢰도
          </h4>
          <p
            className="mt-1 text-xs text-(--commerce-text-secondary)"
            style={{ fontFamily: "var(--commerce-font-body)" }}
          >
            리뷰 품질과 요약 안정성을 종합해 계산합니다.
          </p>
        </div>

        <span
          className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${style.badge}`}
          style={{ fontFamily: "var(--commerce-font-label)" }}
        >
          {style.label}
        </span>
      </div>

      <div className="mt-4">
        <div className="h-2 overflow-hidden rounded-full bg-(--commerce-background-light)">
          <div
            className={`h-full rounded-full transition-[width] duration-300 ${style.bar}`}
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="mt-2 flex items-center justify-between gap-3">
          <span
            className="text-sm font-medium text-(--commerce-text-primary)"
            style={{ fontFamily: "var(--commerce-font-body)" }}
          >
            {progress}%
          </span>
          <button
            type="button"
            onClick={() => setDetailsOpen((value) => !value)}
            className="text-xs font-medium text-(--commerce-text-secondary) underline-offset-2 hover:text-(--commerce-text-primary) hover:underline"
            style={{ fontFamily: "var(--commerce-font-body)" }}
          >
            {detailsOpen ? "상세 닫기" : "상세 보기"}
          </button>
        </div>
      </div>

      {detailsOpen ? (
        <dl className="mt-4 grid gap-3 text-sm">
          <div className="flex items-start justify-between gap-4">
            <dt
              className="text-(--commerce-text-secondary)"
              style={{ fontFamily: "var(--commerce-font-body)" }}
            >
              리뷰 개수
            </dt>
            <dd
              className="text-right font-medium text-(--commerce-text-primary)"
              style={{ fontFamily: "var(--commerce-font-body)" }}
            >
              {reviewCount}개 / {Math.round(breakdown.reviewCount * 100)}점
            </dd>
          </div>
          <div className="flex items-start justify-between gap-4">
            <dt
              className="text-(--commerce-text-secondary)"
              style={{ fontFamily: "var(--commerce-font-body)" }}
            >
              별점 일관성
            </dt>
            <dd
              className="text-right font-medium text-(--commerce-text-primary)"
              style={{ fontFamily: "var(--commerce-font-body)" }}
            >
              분산 {ratingVariance.toFixed(2)} /{" "}
              {Math.round(breakdown.ratingConsistency * 100)}점
            </dd>
          </div>
          <div className="flex items-start justify-between gap-4">
            <dt
              className="text-(--commerce-text-secondary)"
              style={{ fontFamily: "var(--commerce-font-body)" }}
            >
              평균 리뷰 길이
            </dt>
            <dd
              className="text-right font-medium text-(--commerce-text-primary)"
              style={{ fontFamily: "var(--commerce-font-body)" }}
            >
              {Math.round(averageReviewLength)}자 /{" "}
              {Math.round(breakdown.averageReviewLength * 100)}점
            </dd>
          </div>
          <div className="flex items-start justify-between gap-4">
            <dt
              className="text-(--commerce-text-secondary)"
              style={{ fontFamily: "var(--commerce-font-body)" }}
            >
              요약 안정성
            </dt>
            <dd
              className="text-right font-medium text-(--commerce-text-primary)"
              style={{ fontFamily: "var(--commerce-font-body)" }}
            >
              {Math.round(summaryStability * 100)}점
            </dd>
          </div>
        </dl>
      ) : null}
    </section>
  );
}
