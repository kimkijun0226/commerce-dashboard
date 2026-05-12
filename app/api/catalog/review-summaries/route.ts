import { NextRequest, NextResponse } from "next/server";
import { getReviewSummariesByProductIds } from "@/lib/catalog/review-summaries";

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as {
    productIds?: unknown;
  } | null;

  const raw = body?.productIds;
  const productIds = Array.isArray(raw) ? raw.map(String) : [];

  if (productIds.length === 0) {
    return NextResponse.json({ summaries: {} });
  }

  try {
    const summaries = await getReviewSummariesByProductIds(productIds);
    return NextResponse.json({ summaries });
  } catch (err) {
    const message = err instanceof Error ? err.message : "리뷰 요약 조회에 실패했습니다.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

