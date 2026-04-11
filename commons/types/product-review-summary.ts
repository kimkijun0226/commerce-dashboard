/** Supabase `products.review_summary` jsonb 예: `{ "count": 12, "highlight": "몰입감이 좋아요" }` */
export type ProductReviewSummary = {
  count: number;
  highlight: string;
};

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
