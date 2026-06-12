// 전자상거래 리뷰를 Gemini 프롬프트로 바꿔 구조화된 요약 JSON으로 되돌립니다.
import { generateGeminiTextWithSystemPrompt } from "@/lib/ai/gemini";

/** Gemini가 반환해야 하는 리뷰 요약 JSON 구조 */
export interface ReviewSummaryResult {
  summary: string;
  positive_points: string[];
  negative_points: string[];
  keywords: string[];
}

const SYSTEM_PROMPT_BASE = `당신은 전자상거래 플랫폼의 리뷰 요약 전문가입니다.
출력 형식은 반드시 아래 JSON 형식만 반환하세요. 마크다운이나 추가 설명은 절대 포함하지 마세요.

{
  "summary": "전체 리뷰를 2-3줄로 요약한 텍스트",
  "positive_points": ["긍정적인 포인트 1", "긍정적인 포인트 2", ...],
  "negative_points": ["부정적인 포인트 1", "부정적인 포인트 2", ...],
  "keywords": ["키워드1", "키워드2", "키워드3"]
}

주의사항:
- summary는 2-3줄로 간결하게 작성
- positive_points, negative_points는 각각 최대 5개
- keywords는 3-5개
- 반드시 한글로 작성`;

const SYSTEM_PROMPT_INCREMENTAL = `${SYSTEM_PROMPT_BASE}

기존 요약과 새로운 리뷰를 결합하여 업데이트된 요약을 생성하세요.`;

const SYSTEM_PROMPT_FULL = `${SYSTEM_PROMPT_BASE}

제공된 모든 리뷰를 분석하여 종합적인 요약을 생성하세요.`;

/**
 * 마크다운 펜스를 제거한 뒤 JSON을 파싱하고 필수 필드를 검증합니다.
 *
 * @param text - 모델이 반환한 원문
 * @returns 검증된 요약 객체
 */
function parseJSONResponse(text: string): ReviewSummaryResult {
  let cleaned = text.trim();
  cleaned = cleaned.replace(/^```(?:json)?\s*\r?\n?/i, "");
  const closingFence = cleaned.lastIndexOf("```");
  if (closingFence !== -1) {
    cleaned = cleaned.slice(0, closingFence).trim();
  }
  cleaned = cleaned.trim();

  let parsed: unknown;
  try {
    parsed = JSON.parse(cleaned);
  } catch (error) {
    console.error("[parseJSONResponse] JSON 파싱 실패:", error);
    console.error("[parseJSONResponse] 원본 텍스트:", text);
    throw error;
  }

  if (typeof parsed !== "object" || parsed === null) {
    throw new Error("필수 필드가 누락되었습니다.");
  }

  const obj = parsed as Record<string, unknown>;
  const summary = obj.summary;
  const positive_points = obj.positive_points;
  const negative_points = obj.negative_points;
  const keywords = obj.keywords;

  const isStringArray = (v: unknown): v is string[] =>
    Array.isArray(v) && v.every((item) => typeof item === "string");

  if (
    typeof summary !== "string" ||
    !isStringArray(positive_points) ||
    !isStringArray(negative_points) ||
    !isStringArray(keywords)
  ) {
    throw new Error("필수 필드가 누락되었습니다.");
  }

  return {
    summary,
    positive_points,
    negative_points,
    keywords,
  };
}

/** 증분 요약 API용 사용자 프롬프트 문자열을 조립합니다. */
function buildIncrementalUserPrompt(
  existingSummary: ReviewSummaryResult | null,
  newReview: { rating: number; content: string },
): string {
  const blocks: string[] = [];

  if (existingSummary === null) {
    blocks.push("기존 요약이 없습니다. 이것이 첫 번째 리뷰입니다.");
  } else {
    blocks.push(
      `기존 요약:\n요약: ${existingSummary.summary}\n긍정 포인트: ${existingSummary.positive_points.join(", ")}\n부정 포인트: ${existingSummary.negative_points.join(", ")}\n키워드: ${existingSummary.keywords.join(", ")}`,
    );
  }

  blocks.push(`새 리뷰:\n별점: ${newReview.rating}/5\n내용: ${newReview.content}`);
  blocks.push("위 정보를 바탕으로 업데이트된 요약을 JSON 형식으로 생성해주세요.");

  return blocks.join("\n\n");
}

/** 전체 리뷰 요약 API용 사용자 프롬프트 문자열을 조립합니다. */
function buildFullUserPrompt(
  reviews: Array<{ rating: number; content: string }>,
): string {
  const reviewBlocks = reviews.map(
    (r, index) =>
      `리뷰 ${index + 1}:\n별점: ${r.rating}/5\n내용: ${r.content}`,
  );
  return (
    reviewBlocks.join("\n\n") +
    "\n\n위 리뷰들을 종합적으로 분석하여 요약을 JSON 형식으로 생성해주세요."
  );
}

/**
 * 기존 요약과 새 리뷰를 반영해 요약 JSON을 갱신합니다.
 *
 * @param existingSummary - 이전 요약(없으면 null)
 * @param newReview - 새로 반영할 리뷰
 * @returns 파싱·검증된 요약 결과
 */
export async function generateIncrementalReviewSummary(
  existingSummary: ReviewSummaryResult | null,
  newReview: { rating: number; content: string },
): Promise<ReviewSummaryResult> {
  const userPrompt = buildIncrementalUserPrompt(existingSummary, newReview);
  const raw = await generateGeminiTextWithSystemPrompt(
    SYSTEM_PROMPT_INCREMENTAL,
    userPrompt,
  );
  return parseJSONResponse(raw);
}

/**
 * 전체 리뷰 목록을 한 번에 분석해 요약 JSON을 생성합니다.
 *
 * @param reviews - 분석할 리뷰 배열
 * @returns 파싱·검증된 요약 결과
 * @throws 리뷰 배열이 비어 있을 때
 */
export async function generateFullReviewSummary(
  reviews: Array<{ rating: number; content: string }>,
): Promise<ReviewSummaryResult> {
  if (reviews.length === 0) {
    throw new Error("리뷰가 없습니다.");
  }
  const userPrompt = buildFullUserPrompt(reviews);
  const raw = await generateGeminiTextWithSystemPrompt(
    SYSTEM_PROMPT_FULL,
    userPrompt,
  );
  return parseJSONResponse(raw);
}
