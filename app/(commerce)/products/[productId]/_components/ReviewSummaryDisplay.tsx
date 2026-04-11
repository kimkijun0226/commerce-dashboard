"use client";

import { cn } from "@/components/ui";
import { FaCheckCircle, FaRobot } from "react-icons/fa";

const MOCK_AI_SUMMARY =
  "이 제품은 음질과 착용감에서 높은 평가를 받고 있습니다. 대부분의 고객들이 가격 대비 성능이 우수하다고 평가하며, 특히 노이즈 캔슬링 기능과 블루투스 연결성을 칭찬하고 있습니다. 일부 사용자는 배터리 수명이 아쉽다고 언급했지만, 전반적으로 만족도가 매우 높은 제품입니다.";

export type ReviewSummaryDisplayProps = {
  className?: string;
};

export function ReviewSummaryDisplay({ className }: ReviewSummaryDisplayProps) {
  return (
    <section
      className={cn(
        "rounded-lg border border-[#e8ecef]/80 bg-[rgba(232,236,239,0.5)] p-6 shadow-sm",
        className,
      )}
      aria-label="AI 리뷰 요약"
    >
      <div className="flex gap-4">
        <div
          className="flex size-12 shrink-0 items-center justify-center rounded-full bg-[#6c7275] shadow-inner"
          aria-hidden
        >
          <FaRobot className="size-6 text-white" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3
              className="text-base font-semibold leading-[26px] text-[#111827]"
              style={{ fontFamily: "var(--commerce-font-body)" }}
            >
              AI 리뷰 요약
            </h3>
            <span
              className="inline-flex items-center text-[#232627]/95"
              title="검증된 AI 요약"
              aria-hidden
            >
              <FaCheckCircle className="size-4" />
            </span>
          </div>
          <p
            className="mt-2 text-sm leading-6 text-[#141718]"
            style={{ fontFamily: "var(--commerce-font-body)" }}
          >
            {MOCK_AI_SUMMARY}
          </p>
        </div>
      </div>
    </section>
  );
}
