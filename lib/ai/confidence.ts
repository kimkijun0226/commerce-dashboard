// 리뷰 품질 지표를 0~1 범위로 정규화해 AI 요약 신뢰도를 계산합니다.
export type ConfidenceFactors = {
  reviewCount: number;
  ratingVariance: number;
  averageReviewLength: number;
  summaryStability: number;
};

export type ConfidenceLevel = "high" | "medium" | "low";

// 가중치 계산 전에 모든 입력을 0~1 범위 안으로 제한합니다.
function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}

// 리뷰 개수는 20개를 신뢰도 상한선으로 보고 정규화합니다.
function normalizeReviewCount(reviewCount: number): number {
  return clamp01(reviewCount / 20);
}

// 별점 분산이 낮을수록 더 일관된 리뷰라고 보고 높은 점수를 줍니다.
function normalizeRatingConsistency(ratingVariance: number): number {
  return clamp01(1 - ratingVariance / 2);
}

// 리뷰 길이가 충분할수록 요약 근거가 많다고 보고 점수를 올립니다.
function normalizeAverageReviewLength(averageReviewLength: number): number {
  return clamp01(averageReviewLength / 160);
}

// 외부에서 계산된 안정성 값도 동일한 0~1 범위로 맞춥니다.
function normalizeSummaryStability(summaryStability: number): number {
  return clamp01(summaryStability);
}

// 화면에서 세부 점수를 보여줄 수 있도록 정규화된 항목별 점수를 함께 제공합니다.
export function getConfidenceBreakdown(factors: ConfidenceFactors) {
  const reviewCount = normalizeReviewCount(factors.reviewCount);
  const ratingConsistency = normalizeRatingConsistency(factors.ratingVariance);
  const averageReviewLength = normalizeAverageReviewLength(
    factors.averageReviewLength,
  );
  const summaryStability = normalizeSummaryStability(factors.summaryStability);

  return {
    reviewCount,
    ratingConsistency,
    averageReviewLength,
    summaryStability,
  };
}

// 리뷰 개수 비중을 가장 높게 두고, 나머지 품질 지표를 합산해 최종 신뢰도를 만듭니다.
export function calculateConfidence(factors: ConfidenceFactors): number {
  const normalized = getConfidenceBreakdown(factors);
  return clamp01(
    normalized.reviewCount * 0.4 +
      normalized.ratingConsistency * 0.2 +
      normalized.averageReviewLength * 0.2 +
      normalized.summaryStability * 0.2,
  );
}

// UI 배지/색상에 바로 매핑할 수 있게 신뢰도 구간을 단순한 레벨로 나눕니다.
export function getConfidenceLevel(
  confidence: number,
): ConfidenceLevel {
  if (confidence >= 0.7) return "high";
  if (confidence >= 0.4) return "medium";
  return "low";
}
