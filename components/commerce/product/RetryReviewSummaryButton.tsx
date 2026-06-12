"use client";

// 관리자 재생성 요청을 감싸고, 실패 횟수와 최근 오류 이력을 함께 관리합니다.
import { generateAiReviewSummary } from "@/app/(commerce)/products/[productId]/review-summary-actions";
import { useSessionStore } from "@/commons/store/session-store";
import { Button } from "@/components/ui";
import type { ReviewSummaryResult } from "@/lib/ai/review-summary";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useTransition } from "react";
import toast from "react-hot-toast";

type RetryHistoryItem = {
  id: string;
  status: "success" | "error";
  message: string;
  createdAt: string;
};

type RetryStateSnapshot = {
  failureCount: number;
  lastError: string | null;
  retryHistory: RetryHistoryItem[];
};

export type RetryReviewSummaryButtonProps = {
  isAdmin: boolean;
  productId: string;
  onRegenerated?: (payload: {
    summary: ReviewSummaryResult;
    previousSummary: ReviewSummaryResult | null;
  }) => void;
};

// 관리자만 쓸 수 있는 재생성 버튼과 재시도 상태 표시를 함께 제공합니다.
export function RetryReviewSummaryButton({
  isAdmin,
  productId,
  onRegenerated,
}: RetryReviewSummaryButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [failureCount, setFailureCount] = useState(0);
  const [lastError, setLastError] = useState<string | null>(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [retryHistory, setRetryHistory] = useState<RetryHistoryItem[]>([]);

  const sessionIsAdmin = useSessionStore((s) => s.isAdmin);
  const effectiveAdmin = useMemo(
    () => isAdmin || sessionIsAdmin,
    [isAdmin, sessionIsAdmin],
  );
  const maxRetries = 3;
  const retryLimitReached = failureCount >= maxRetries;
  const storageKey = useMemo(
    () => `review-summary-retry-state:${productId}`,
    [productId],
  );

  // 새로고침 후에도 실패 횟수와 히스토리를 유지해 상태가 갑자기 3회로 돌아가지 않게 합니다.
  useEffect(() => {
    if (typeof window === "undefined") return;

    const raw = window.sessionStorage.getItem(storageKey);
    if (!raw) return;

    try {
      const parsed = JSON.parse(raw) as Partial<RetryStateSnapshot>;
      setFailureCount(
        typeof parsed.failureCount === "number" ? parsed.failureCount : 0,
      );
      setLastError(
        typeof parsed.lastError === "string" ? parsed.lastError : null,
      );
      setRetryHistory(Array.isArray(parsed.retryHistory) ? parsed.retryHistory : []);
    } catch {
      window.sessionStorage.removeItem(storageKey);
    }
  }, [storageKey]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const snapshot: RetryStateSnapshot = {
      failureCount,
      lastError,
      retryHistory,
    };
    window.sessionStorage.setItem(storageKey, JSON.stringify(snapshot));
  }, [failureCount, lastError, retryHistory, storageKey]);

  if (!effectiveAdmin) {
    return null;
  }

  return (
    <div className="flex flex-col items-start gap-2">
      <Button
        type="button"
        variant="secondary"
        size="sm"
        className="shrink-0 rounded-full px-4 text-xs font-medium sm:text-sm"
        disabled={isPending || retryLimitReached}
        onClick={() =>
          startTransition(async () => {
            try {
              // 성공 시 새 요약과 이전 요약을 부모에 넘겨 Diff/승인 흐름으로 이어집니다.
              const result = await generateAiReviewSummary(productId);
              if (!result.ok) {
                setFailureCount((value) => value + 1);
                setLastError(result.error);
                setHistoryOpen(true);
                setRetryHistory((history) => [
                  {
                    id: `${Date.now()}-error`,
                    status: "error",
                    message: result.error,
                    createdAt: new Date().toLocaleString("ko-KR"),
                  },
                  ...history,
                ]);
                toast.error(result.error);
                return;
              }

              // 성공하면 연속 실패 카운트를 초기화해 다시 정상 상태에서 재시도할 수 있게 합니다.
              setFailureCount(0);
              setLastError(null);
              setHistoryOpen(true);
              setRetryHistory((history) => [
                {
                  id: `${Date.now()}-success`,
                  status: "success",
                  message: "AI 리뷰 요약 재생성 성공",
                  createdAt: new Date().toLocaleString("ko-KR"),
                },
                ...history,
              ]);
              toast.success("AI 리뷰 요약이 갱신되었습니다.");
              if (onRegenerated) {
                onRegenerated({
                  summary: result.summary,
                  previousSummary: result.previousSummary,
                });
                return;
              }
              router.refresh();
            } catch (e) {
              // 예외도 동일한 재시도 이력으로 남겨 버튼 상태와 히스토리를 맞춥니다.
              const message =
                e instanceof Error
                  ? e.message
                  : "요약 생성 중 오류가 발생했습니다.";
              setFailureCount((value) => value + 1);
              setLastError(message);
              setHistoryOpen(true);
              setRetryHistory((history) => [
                {
                  id: `${Date.now()}-exception`,
                  status: "error",
                  message,
                  createdAt: new Date().toLocaleString("ko-KR"),
                },
                ...history,
              ]);
              toast.error(message);
            }
          })
        }
        style={{ fontFamily: "var(--commerce-font-label)" }}
      >
        {isPending
          ? "재생성 중..."
          : retryLimitReached
            ? "연속 실패로 잠시 잠김"
            : "리뷰 요약 재생성"}
      </Button>

      <p
        className="text-xs text-(--commerce-text-secondary)"
        style={{ fontFamily: "var(--commerce-font-body)" }}
      >
        연속 실패 {failureCount}/{maxRetries}회. 성공하면 실패 횟수는 초기화됩니다.
      </p>

      {lastError ? (
        <p
          className="text-xs text-(--commerce-semantic-danger)"
          style={{ fontFamily: "var(--commerce-font-body)" }}
        >
          마지막 오류: {lastError}
        </p>
      ) : null}

      {retryLimitReached ? (
        <button
          type="button"
          onClick={() => {
            setFailureCount(0);
            setLastError(null);
          }}
          className="text-xs font-medium text-(--commerce-text-secondary) underline-offset-2 hover:text-(--commerce-text-primary) hover:underline"
          style={{ fontFamily: "var(--commerce-font-body)" }}
        >
          실패 횟수 초기화
        </button>
      ) : null}

      {retryHistory.length > 0 ? (
        <div className="w-full">
          <button
            type="button"
            onClick={() => setHistoryOpen((value) => !value)}
            className="text-xs font-medium text-(--commerce-text-secondary) underline-offset-2 hover:text-(--commerce-text-primary) hover:underline"
            style={{ fontFamily: "var(--commerce-font-body)" }}
          >
            {historyOpen ? "재시도 히스토리 닫기" : "재시도 히스토리 보기"}
          </button>

          {historyOpen ? (
            <ul className="mt-2 space-y-2 rounded-lg border border-(--commerce-border-subtle) bg-(--commerce-background-paper) p-3">
              {retryHistory.map((item) => (
                <li key={item.id} className="text-xs">
                  <p
                    className={
                      item.status === "success"
                        ? "text-emerald-700"
                        : "text-(--commerce-semantic-danger)"
                    }
                    style={{ fontFamily: "var(--commerce-font-body)" }}
                  >
                    {item.status === "success" ? "성공" : "실패"} · {item.createdAt}
                  </p>
                  <p
                    className="mt-1 text-(--commerce-text-secondary)"
                    style={{ fontFamily: "var(--commerce-font-body)" }}
                  >
                    {item.message}
                  </p>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
