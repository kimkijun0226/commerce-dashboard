import type { ReviewSummaryResult } from "@/lib/ai/review-summary";

/** Supabase `products.review_summary` jsonb 예: `{ "count": 12, "highlight": "몰입감이 좋아요" }` */
export type ProductReviewSummary = {
  count: number;
  highlight: string;
};

function isStringArray(v: unknown): v is string[] {
  return Array.isArray(v) && v.every((item) => typeof item === "string");
}

/**
 * `products.review_summary` JSON에서 AI 요약(`ai` 객체)만 추출합니다.
 */
export function parseAiReviewSummaryFromProductJson(
  raw: unknown,
): ReviewSummaryResult | null {
  if (raw === null || raw === undefined) return null;
  if (typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  const ai = o.ai;
  if (typeof ai !== "object" || ai === null) return null;
  const a = ai as Record<string, unknown>;
  if (
    typeof a.summary !== "string" ||
    !isStringArray(a.positive_points) ||
    !isStringArray(a.negative_points) ||
    !isStringArray(a.keywords)
  ) {
    return null;
  }
  return {
    summary: a.summary,
    positive_points: a.positive_points,
    negative_points: a.negative_points,
    keywords: a.keywords,
  };
}

export function parseProductReviewSummary(
  raw: unknown,
): ProductReviewSummary | null {
  if (raw === null || raw === undefined) return null;
  if (typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  const c = o.count;
  let count: number | null = null;
  if (typeof c === "number" && Number.isFinite(c)) {
    count = Math.max(0, Math.floor(c));
  } else if (typeof c === "string" && /^\d+$/.test(c.trim())) {
    count = Math.max(0, parseInt(c.trim(), 10));
  }
  const hi = o.highlight;
  const highlight =
    typeof hi === "string" ? hi.trim() : hi != null ? String(hi).trim() : "";

  if (count === null) return null;
  return { count, highlight };
}
