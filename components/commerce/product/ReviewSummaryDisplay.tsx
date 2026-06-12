"use client";

// 저장된 AI 요약을 보여주고, 백그라운드 재생성 중에는 폴링으로 변경 시점을 감지합니다.
import { getReviewSummary } from "@/app/(commerce)/products/[productId]/review-summary-actions";
import { commerceColors } from "@/commons/constants/color";
import { cn } from "@/components/ui";
import type { ReviewSummaryResult } from "@/lib/ai/review-summary";
import { useSearchParams } from "next/navigation";
import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import { FaCheckCircle, FaRobot } from "react-icons/fa";

const AI_POLL_INTERVAL_MS = 2000;
const AI_POLL_MAX_ROUNDS = 45;
// 리뷰 작성/수정/삭제 직후 요약 폴링을 시작시키는 클라이언트 이벤트입니다.
const REVIEW_AI_REFRESH_EVENT = "commerce:review-ai-refresh-start";

// 폴링 중 요약이 실제로 바뀌었는지 비교하기 위한 간단한 직렬화 키를 만듭니다.
function fingerprintSummary(
  value: ReviewSummaryResult | null | undefined,
): string {
  if (value === undefined) return "__pending__";
  if (value === null) return "__empty__";
  return JSON.stringify({
    summary: value.summary,
    positive_points: value.positive_points,
    negative_points: value.negative_points,
    keywords: value.keywords,
  });
}

export type ReviewSummaryDisplayProps = {
  productId: string;
  initialData?: ReviewSummaryResult | null;
  /** 값이 바뀔 때마다 서버에서 요약을 다시 불러옵니다(전체 스켈레톤). */
  reloadKey?: number;
  /**
   * 0보다 크게 바뀔 때마다: 현재 요약을 유지한 채 백그라운드에서 폴링하며,
   * DB의 AI 요약이 바뀌는 순간 화면을 갱신합니다(리뷰 제출·수정·삭제 후).
   */
  expectBackgroundAiUpdate?: number;
  /** 제목 줄 오른쪽(예: 관리자 재생성 버튼) — 요약 유무와 관계없이 항상 표시 */
  rightSlot?: ReactNode;
  onSummaryChange?: (summary: ReviewSummaryResult | null) => void;
  className?: string;
};

const sectionSurface = cn(
  "rounded-lg border border-(--commerce-border-subtle) bg-(--commerce-background-light)/80 p-6 shadow-sm",
);

/**
 * PDP용 AI 리뷰 요약 블록. `getReviewSummary`로 DB의 `review_summary.ai`를 표시합니다.
 */
// 저장된 AI 요약과 백그라운드 갱신 상태를 함께 그리는 기본 표시 컴포넌트입니다.
export function ReviewSummaryDisplay({
  productId,
  initialData,
  reloadKey = 0,
  expectBackgroundAiUpdate = 0,
  rightSlot,
  onSummaryChange,
  className,
}: ReviewSummaryDisplayProps) {
  const [data, setData] = useState<ReviewSummaryResult | null | undefined>(
    initialData,
  );
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isAwaitingAiRefresh, setIsAwaitingAiRefresh] = useState(false);
  const [aiRefreshTimedOut, setAiRefreshTimedOut] = useState(false);
  const [backgroundUpdateToken, setBackgroundUpdateToken] = useState(0);
  const dataRef = useRef(data);
  dataRef.current = data;
  const searchParams = useSearchParams();

  useEffect(() => {
    if (initialData === undefined) return;
    setLoadError(null);
    setData(initialData);
  }, [initialData, productId]);

  // 부모가 Diff/신뢰도 상태를 동기화할 수 있도록 현재 요약을 바깥으로 전달합니다.
  useEffect(() => {
    if (data === undefined) return;
    onSummaryChange?.(data);
  }, [data, onSummaryChange]);

  useEffect(() => {
    if (reloadKey === 0 && initialData !== undefined) {
      return;
    }

    let cancelled = false;
    void (async () => {
      await Promise.resolve();
      if (cancelled) return;
      setLoadError(null);
      setData(undefined);
      try {
        const summary = await getReviewSummary(productId);
        if (!cancelled) setData(summary);
      } catch (e) {
        console.error("[ReviewSummaryDisplay]", e);
        if (!cancelled) {
          setLoadError("요약을 불러오지 못했습니다.");
          setData(null);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [initialData, productId, reloadKey]);

  useEffect(() => {
    if (expectBackgroundAiUpdate <= 0) return;
    setBackgroundUpdateToken((value) => value + 1);
  }, [expectBackgroundAiUpdate]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const onRefreshStart = (event: Event) => {
      const detail = (event as CustomEvent<{ productId?: string }>).detail;
      if (detail?.productId !== productId) return;
      setBackgroundUpdateToken((value) => value + 1);
    };
    window.addEventListener(REVIEW_AI_REFRESH_EVENT, onRefreshStart);
    return () => {
      window.removeEventListener(REVIEW_AI_REFRESH_EVENT, onRefreshStart);
    };
  }, [productId]);

  useEffect(() => {
    if (searchParams.get("aiRefreshing") !== "1") return;
    setBackgroundUpdateToken((value) => value + 1);

    const url = new URL(window.location.href);
    url.searchParams.delete("aiRefreshing");
    window.history.replaceState(window.history.state, "", url.toString());
  }, [productId, searchParams]);

  useEffect(() => {
    if (backgroundUpdateToken <= 0) return;

    let cancelled = false;
    setAiRefreshTimedOut(false);
    setIsAwaitingAiRefresh(true);

    void (async () => {
      // 현재 화면에 보이는 요약을 기준으로 잡고, DB 값이 바뀌는 순간만 갱신합니다.
      let baselineFp: string;
      const snap = dataRef.current;
      if (snap !== undefined) {
        baselineFp = fingerprintSummary(snap);
      } else {
        try {
          const baseline = await getReviewSummary(productId);
          if (cancelled) return;
          baselineFp = fingerprintSummary(baseline);
        } catch (e) {
          console.error("[ReviewSummaryDisplay] baseline poll", e);
          if (!cancelled) {
            setIsAwaitingAiRefresh(false);
            setAiRefreshTimedOut(true);
          }
          return;
        }
      }

      for (let round = 0; round < AI_POLL_MAX_ROUNDS; round++) {
        await new Promise((r) => setTimeout(r, AI_POLL_INTERVAL_MS));
        if (cancelled) return;
        try {
          const next = await getReviewSummary(productId);
          if (cancelled) return;
          if (fingerprintSummary(next) !== baselineFp) {
            setData(next);
            setLoadError(null);
            setIsAwaitingAiRefresh(false);
            return;
          }
        } catch (e) {
          console.error("[ReviewSummaryDisplay] poll", e);
        }
      }

      if (!cancelled) {
        setIsAwaitingAiRefresh(false);
        setAiRefreshTimedOut(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [backgroundUpdateToken, productId]);

  const loading = data === undefined;
  const hasSummary = data != null && !loadError;

  return (
    <section
      className={cn(sectionSurface, className)}
      aria-label="AI 리뷰 요약"
      aria-busy={loading || isAwaitingAiRefresh || undefined}
    >
      <div className="flex gap-4">
        <div
          className="flex size-12 shrink-0 items-center justify-center rounded-full shadow-inner"
          style={{ backgroundColor: commerceColors.text.secondary }}
          aria-hidden
        >
          <FaRobot className="size-6 text-(--commerce-text-inverse)" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center justify-between gap-2 gap-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <h3
                className="text-base font-semibold leading-[26px] text-(--commerce-text-primary)"
                style={{ fontFamily: "var(--commerce-font-heading)" }}
              >
                AI 리뷰 요약
              </h3>
              {hasSummary ? (
                <span
                  className="inline-flex items-center text-(--commerce-semantic-success)"
                  title="검증된 AI 요약"
                  aria-hidden
                >
                  <FaCheckCircle className="size-4" />
                </span>
              ) : null}
            </div>
            {rightSlot}
          </div>

          {isAwaitingAiRefresh && !loading ? (
            <div
              className="mt-3 flex items-center gap-2 rounded-md border border-(--commerce-border-subtle) bg-(--commerce-background-paper) px-3 py-2.5 text-sm text-(--commerce-text-primary)"
              style={{ fontFamily: "var(--commerce-font-body)" }}
              role="status"
              aria-live="polite"
            >
              <span
                className="inline-block size-4 shrink-0 animate-spin rounded-full border-2 border-(--commerce-border-default) border-t-(--commerce-primary-main)"
                aria-hidden
              />
              <span>
                AI가 최신 리뷰를 반영해 요약을 갱신하고 있습니다…
              </span>
            </div>
          ) : null}

          {aiRefreshTimedOut && !loading && !isAwaitingAiRefresh ? (
            <p
              className="mt-2 text-sm text-(--commerce-text-muted)"
              style={{ fontFamily: "var(--commerce-font-body)" }}
              role="status"
            >
              요약 반영이 지연되고 있습니다. 잠시 후 새로고침하거나 페이지를 다시
              열어 주세요.
            </p>
          ) : null}

          {loading ? (
            <p
              className="mt-3 text-sm text-(--commerce-text-muted)"
              style={{ fontFamily: "var(--commerce-font-body)" }}
            >
              AI 리뷰 요약을 불러오는 중…
            </p>
          ) : loadError ? (
            <p
              className="mt-3 text-sm text-(--commerce-semantic-danger)"
              style={{ fontFamily: "var(--commerce-font-body)" }}
              role="alert"
            >
              {loadError}
            </p>
          ) : data === null ? (
            <p
              className="mt-3 text-sm text-(--commerce-text-secondary)"
              style={{ fontFamily: "var(--commerce-font-body)" }}
            >
              아직 등록된 AI 리뷰 요약이 없습니다.
            </p>
          ) : (
            <>
              <p
                className="mt-3 text-sm leading-6 text-(--commerce-text-primary)"
                style={{ fontFamily: "var(--commerce-font-body)" }}
              >
                {data.summary}
              </p>

              <div className="mt-5 grid gap-5 sm:grid-cols-2">
                <div>
                  <h4
                    className="text-xs font-semibold uppercase tracking-wide text-(--commerce-text-secondary)"
                    style={{ fontFamily: "var(--commerce-font-label)" }}
                  >
                    긍정 포인트
                  </h4>
                  <ul
                    className="mt-2 list-inside list-disc space-y-1 text-sm text-(--commerce-text-primary)"
                    style={{ fontFamily: "var(--commerce-font-body)" }}
                  >
                    {data.positive_points.map((item, i) => (
                      <li key={`p-${i}-${item.slice(0, 24)}`}>{item}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4
                    className="text-xs font-semibold uppercase tracking-wide text-(--commerce-text-secondary)"
                    style={{ fontFamily: "var(--commerce-font-label)" }}
                  >
                    부정 포인트
                  </h4>
                  <ul
                    className="mt-2 list-inside list-disc space-y-1 text-sm text-(--commerce-text-primary)"
                    style={{ fontFamily: "var(--commerce-font-body)" }}
                  >
                    {data.negative_points.map((item, i) => (
                      <li key={`n-${i}-${item.slice(0, 24)}`}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-5">
                <h4
                  className="text-xs font-semibold uppercase tracking-wide text-(--commerce-text-secondary)"
                  style={{ fontFamily: "var(--commerce-font-label)" }}
                >
                  키워드
                </h4>
                <ul className="mt-2 flex flex-wrap gap-2">
                  {data.keywords.map((kw, i) => (
                    <li key={`k-${i}-${kw}`}>
                      <span
                        className="inline-flex items-center rounded-full border border-(--commerce-border-subtle) bg-(--commerce-background-paper) px-3 py-1 text-xs font-medium text-(--commerce-text-primary)"
                        style={{ fontFamily: "var(--commerce-font-label)" }}
                      >
                        {kw}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
