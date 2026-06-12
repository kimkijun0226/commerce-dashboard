import { config } from "dotenv";
import { join } from "path";

import type { SupabaseClient } from "@supabase/supabase-js";

import {
  parseAiReviewSummaryFromProductJson,
  parseProductReviewSummary,
} from "@/commons/types/product-review-summary";
import { generateFullReviewSummary } from "@/lib/ai/review-summary";
import type { Json } from "@/types/supabase";

import { createSupabaseSeedClient } from "./seed-reviews";

config({ path: join(process.cwd(), ".env.local") });

type ReviewRow = { rating: number; content: string | null };

/** 테스트·키보드 난타·의미 없는 짧은 댓글 등 */
export function isJunkReviewContent(content: string | null | undefined): boolean {
  const c = (content ?? "").trim();
  if (!c) return true;

  if (/테스트/i.test(c)) return true;
  if (/\btest\b/i.test(c) && c.length < 50) return true;
  if (/^[ㄱ-ㅎㅏ-ㅣ\s]{4,}$/.test(c)) return true;
  if (/ㅁㄴㅇ|ㅋ{3,}|ㅎ{3,}|asdf|qwer|dummy|lorem ipsum/i.test(c)) return true;
  if (/!!{2,}/.test(c) && /~{2,}/.test(c)) return true;
  if (c === "빨간색과 파란색이 너무 아름다움") return true;
  if (c === "엄청 시원 하고 단단해서 좋아요") return true;

  if (c.length < 12 && !/[다요음함죠]\s*[.!?~]*$/.test(c)) return true;

  return false;
}

function mergeReviewSummaryJson(
  current: Json | null | undefined,
  ai: Awaited<ReturnType<typeof generateFullReviewSummary>>,
  reviewCount: number,
): Json {
  const prev = parseProductReviewSummary(current ?? null);
  const highlight =
    ai.positive_points[0]?.slice(0, 80) ||
    ai.summary.split("\n")[0]?.slice(0, 80) ||
    prev?.highlight ||
    "";

  return {
    count: reviewCount,
    highlight,
    ai,
  } as Json;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function parseQuotaRetryMs(message: string): number | null {
  const match = message.match(/retry in ([\d.]+)s/i);
  if (!match?.[1]) return null;
  const sec = Number(match[1]);
  return Number.isFinite(sec) ? Math.ceil(sec * 1000) + 2000 : null;
}

async function withQuotaRetry<T>(
  label: string,
  fn: () => Promise<T>,
): Promise<T> {
  try {
    return await fn();
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    const waitMs = parseQuotaRetryMs(msg);
    if (!waitMs) throw e;
    console.warn(`[ai] ${label} 무료 할당량 대기 ${Math.round(waitMs / 1000)}초 후 재시도`);
    await sleep(waitMs);
    return fn();
  }
}

async function deleteJunkReviews(supabase: SupabaseClient): Promise<number> {
  const { data: rows, error } = await supabase
    .from("reviews")
    .select("id, product_id, content");

  if (error) throw error;

  const junk = (rows ?? []).filter((r) => isJunkReviewContent(r.content));

  if (junk.length === 0) {
    console.log("[cleanup] 삭제할 저품질 리뷰 없음");
    return 0;
  }

  console.log(`[cleanup] 저품질 리뷰 ${junk.length}건 삭제`);
  for (const row of junk) {
    console.log(`  - "${String(row.content).slice(0, 60)}"`);
  }

  const { error: delError } = await supabase
    .from("reviews")
    .delete()
    .in(
      "id",
      junk.map((r) => r.id),
    );

  if (delError) throw delError;

  return junk.length;
}

async function refreshProductReviewSummary(
  supabase: SupabaseClient,
  productId: string,
  productName: string,
): Promise<boolean> {
  const { data: reviewRows, error: reviewsError } = await supabase
    .from("reviews")
    .select("rating, content")
    .eq("product_id", productId);

  if (reviewsError) {
    console.error(`[ai] 리뷰 조회 실패 (${productName}):`, reviewsError.message);
    return false;
  }

  const reviews = (reviewRows ?? [])
    .filter(
      (r): r is ReviewRow =>
        !isJunkReviewContent(r.content) &&
        r.content != null &&
        String(r.content).trim().length > 0 &&
        r.rating != null,
    )
    .map((r) => ({
      rating: Number(r.rating),
      content: String(r.content).trim(),
    }));

  const { data: productRow, error: productError } = await supabase
    .from("products")
    .select("review_summary")
    .eq("id", productId)
    .maybeSingle();

  if (productError) {
    console.error(`[ai] 상품 조회 실패 (${productName}):`, productError.message);
    return false;
  }

  const reviewCount = reviews.length;
  let ratingAverage: number | null = null;
  if (reviewCount > 0) {
    const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
    ratingAverage = Math.round((sum / reviewCount) * 10) / 10;
  }

  if (reviewCount === 0) {
    await supabase
      .from("products")
      .update({
        rating_average: null,
        review_summary: { count: 0, highlight: "" },
      })
      .eq("id", productId);
    console.log(`[ai] "${productName}": 리뷰 없음 → 요약 초기화`);
    return true;
  }

  const ai = await withQuotaRetry(productName, () =>
    generateFullReviewSummary(reviews),
  );
  const merged = mergeReviewSummaryJson(productRow?.review_summary ?? null, ai, reviewCount);

  const { error: updateError } = await supabase
    .from("products")
    .update({
      rating_average: ratingAverage,
      review_summary: merged,
    })
    .eq("id", productId);

  if (updateError) {
    console.error(`[ai] 저장 실패 (${productName}):`, updateError.message);
    return false;
  }

  console.log(`[ai] "${productName}": AI 요약 갱신 (${reviewCount}건)`);
  return true;
}

export async function backfillReviewAiSummaries(): Promise<void> {
  const supabase = createSupabaseSeedClient();

  const deleted = await deleteJunkReviews(supabase);
  if (deleted > 0) {
    console.log(`[cleanup] 삭제 완료: ${deleted}건`);
  }

  const { data: products, error: productsError } = await supabase
    .from("products")
    .select("id, name, review_summary")
    .eq("status", "registered")
    .order("name", { ascending: true });

  if (productsError) throw productsError;
  if (!products?.length) {
    console.log("[ai] registered 상품 없음");
    return;
  }

  const toProcess = products.filter(
    (p) => !parseAiReviewSummaryFromProductJson(p.review_summary ?? null),
  );

  console.log(
    `[ai] AI 요약 재생성 대상: ${toProcess.length}개 (전체 ${products.length}개 중 미생성)`,
  );

  if (toProcess.length === 0) {
    console.log("[ai] 모든 상품에 AI 요약이 있습니다.");
    return;
  }

  let ok = 0;
  let fail = 0;

  for (let i = 0; i < toProcess.length; i++) {
    const product = toProcess[i];
    if (!product) continue;

    try {
      const success = await refreshProductReviewSummary(
        supabase,
        product.id,
        product.name,
      );
      if (success) ok += 1;
      else fail += 1;
    } catch (e) {
      fail += 1;
      const msg = e instanceof Error ? e.message : String(e);
      console.error(`[ai] "${product.name}" 실패:`, msg);
    }

    if (i < toProcess.length - 1) {
      await sleep(3500);
    }
  }

  console.log(`[ai] 완료: 성공 ${ok}개, 실패 ${fail}개`);
}

async function main() {
  await backfillReviewAiSummaries();
}

const isDirectRun = process.argv[1]?.includes("backfill-review-ai-summaries");
if (isDirectRun) {
  main()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error("AI 리뷰 요약 백필 오류:", err);
      process.exit(1);
    });
}
