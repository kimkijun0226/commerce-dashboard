"use client";

// 새 요약과 이전 요약의 차이를 단어 단위로 비교해 승인/거부 판단을 돕습니다.
import type { ReviewSummaryResult } from "@/lib/ai/review-summary";
import { useEffect, useMemo, useState } from "react";

type DiffToken = {
  type: "added" | "removed" | "unchanged";
  text: string;
};

// 단어 단위 diff를 위해 문자열을 공백 기준 토큰 배열로 나눕니다.
function splitWords(text: string): string[] {
  return text.trim().length === 0 ? [] : text.trim().split(/\s+/);
}

// LCS 방식으로 공통 단어를 기준 삼아 추가/삭제 토큰을 구합니다.
export function diffText(before: string, after: string): DiffToken[] {
  const prev = splitWords(before);
  const next = splitWords(after);
  const dp = Array.from({ length: prev.length + 1 }, () =>
    Array.from({ length: next.length + 1 }, () => 0),
  );

  for (let i = prev.length - 1; i >= 0; i -= 1) {
    for (let j = next.length - 1; j >= 0; j -= 1) {
      dp[i][j] =
        prev[i] === next[j]
          ? dp[i + 1][j + 1] + 1
          : Math.max(dp[i + 1][j], dp[i][j + 1]);
    }
  }

  const tokens: DiffToken[] = [];
  let i = 0;
  let j = 0;
  while (i < prev.length && j < next.length) {
    if (prev[i] === next[j]) {
      tokens.push({ type: "unchanged", text: prev[i] });
      i += 1;
      j += 1;
      continue;
    }
    if (dp[i + 1][j] >= dp[i][j + 1]) {
      tokens.push({ type: "removed", text: prev[i] });
      i += 1;
      continue;
    }
    tokens.push({ type: "added", text: next[j] });
    j += 1;
  }

  while (i < prev.length) {
    tokens.push({ type: "removed", text: prev[i] });
    i += 1;
  }
  while (j < next.length) {
    tokens.push({ type: "added", text: next[j] });
    j += 1;
  }

  return tokens;
}

// 토큰 타입에 따라 추가/삭제/유지 텍스트를 서로 다른 스타일로 렌더링합니다.
function renderTokens(tokens: DiffToken[]) {
  return tokens.map((token, index) => {
    const className =
      token.type === "added"
        ? "rounded bg-emerald-100 px-1 py-0.5 text-emerald-800"
        : token.type === "removed"
          ? "rounded bg-rose-100 px-1 py-0.5 text-rose-700 line-through"
          : "text-(--commerce-text-primary)";

    return (
      <span key={`${token.type}-${index}-${token.text}`} className={className}>
        {token.text}
        {index < tokens.length - 1 ? " " : ""}
      </span>
    );
  });
}

type SectionProps = {
  title: string;
  before: string;
  after: string;
};

// 요약/포인트/키워드를 같은 렌더링 규칙으로 비교하기 위한 공통 섹션입니다.
function DiffSection({ title, before, after }: SectionProps) {
  const tokens = useMemo(() => diffText(before, after), [after, before]);

  return (
    <div>
      <h5
        className="text-xs font-semibold uppercase tracking-wide text-(--commerce-text-secondary)"
        style={{ fontFamily: "var(--commerce-font-label)" }}
      >
        {title}
      </h5>
      <div
        className="mt-2 rounded-lg border border-(--commerce-border-subtle) bg-(--commerce-background-paper) p-3 text-sm leading-6"
        style={{ fontFamily: "var(--commerce-font-body)" }}
      >
        {tokens.length > 0 ? renderTokens(tokens) : "변경 사항이 없습니다."}
      </div>
    </div>
  );
}

export type ReviewSummaryDiffProps = {
  previousSummary: ReviewSummaryResult | null;
  currentSummary: ReviewSummaryResult | null;
  onApprove: () => void;
  onReject: () => void;
  autoOpenToken?: number;
};

// 이전 요약과 새 요약의 차이를 열고 닫으며, 승인/거부 액션으로 연결합니다.
export function ReviewSummaryDiff({
  previousSummary,
  currentSummary,
  onApprove,
  onReject,
  autoOpenToken = 0,
}: ReviewSummaryDiffProps) {
  const [open, setOpen] = useState(false);
  const same =
    previousSummary != null &&
    currentSummary != null &&
    JSON.stringify(previousSummary) === JSON.stringify(currentSummary);
  const hasDiff = Boolean(previousSummary && currentSummary) && !same;

  // 새 비교 결과가 들어오면 패널을 바로 열고, 비교 대상이 사라지면 닫습니다.
  useEffect(() => {
    if (hasDiff) {
      setOpen(true);
      return;
    }
    setOpen(false);
  }, [autoOpenToken, hasDiff]);

  if (!previousSummary || !currentSummary || !hasDiff) {
    return null;
  }

  return (
    <section className="rounded-xl border border-(--commerce-border-subtle) bg-(--commerce-background-paper) p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h4
            className="text-sm font-semibold text-(--commerce-text-primary)"
            style={{ fontFamily: "var(--commerce-font-heading)" }}
          >
            요약 변경 비교
          </h4>
          <p
            className="mt-1 text-xs text-(--commerce-text-secondary)"
            style={{ fontFamily: "var(--commerce-font-body)" }}
          >
            재생성 직후 바로 비교할 수 있도록 이전/새 요약을 동시에 보여 줍니다.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className="text-xs font-medium text-(--commerce-text-secondary) underline-offset-2 hover:text-(--commerce-text-primary) hover:underline"
          style={{ fontFamily: "var(--commerce-font-body)" }}
        >
          {open ? "상세 변경 접기" : "상세 변경 보기"}
        </button>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <div className="rounded-xl border border-(--commerce-border-subtle) bg-(--commerce-background-light) p-4">
          <p
            className="text-xs font-semibold uppercase tracking-wide text-(--commerce-text-secondary)"
            style={{ fontFamily: "var(--commerce-font-label)" }}
          >
            기존 요약
          </p>
          <p
            className="mt-2 text-sm leading-6 text-(--commerce-text-primary)"
            style={{ fontFamily: "var(--commerce-font-body)" }}
          >
            {previousSummary.summary}
          </p>
          <button
            type="button"
            onClick={onReject}
            className="mt-4 rounded-full border border-(--commerce-border-primary) px-4 py-2 text-xs font-semibold text-(--commerce-text-primary) hover:bg-(--commerce-background-paper)"
            style={{ fontFamily: "var(--commerce-font-label)" }}
          >
            기존 요약 유지
          </button>
        </div>

        <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-4">
          <p
            className="text-xs font-semibold uppercase tracking-wide text-emerald-700"
            style={{ fontFamily: "var(--commerce-font-label)" }}
          >
            새 요약
          </p>
          <p
            className="mt-2 text-sm leading-6 text-(--commerce-text-primary)"
            style={{ fontFamily: "var(--commerce-font-body)" }}
          >
            {currentSummary.summary}
          </p>
          <button
            type="button"
            onClick={onApprove}
            className="mt-4 rounded-full bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-500"
            style={{ fontFamily: "var(--commerce-font-label)" }}
          >
            새 요약 적용
          </button>
        </div>
      </div>

      {open ? (
        <>
          <div className="mt-4 space-y-4">
            <DiffSection
              title="요약"
              before={previousSummary.summary}
              after={currentSummary.summary}
            />
            <DiffSection
              title="긍정 포인트"
              before={previousSummary.positive_points.join(" / ")}
              after={currentSummary.positive_points.join(" / ")}
            />
            <DiffSection
              title="부정 포인트"
              before={previousSummary.negative_points.join(" / ")}
              after={currentSummary.negative_points.join(" / ")}
            />
            <DiffSection
              title="키워드"
              before={previousSummary.keywords.join(" / ")}
              after={currentSummary.keywords.join(" / ")}
            />
          </div>
        </>
      ) : null}
    </section>
  );
}
