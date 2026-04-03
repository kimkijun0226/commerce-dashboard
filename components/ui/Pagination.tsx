"use client";

import { adminColors, commerceColors } from "@/commons/constants/color";
import { adminTypography } from "@/commons/constants/typography";
import { cn } from "@/components/ui/cn";
import { typographyToStyle } from "@/components/ui/typography-styles";
import type { ButtonHTMLAttributes } from "react";

const cell = 28;
const typo = typographyToStyle(adminTypography.pagination);

export type PaginationProps = {
  currentPage: number;
  totalPages: number;
  onPageChange?: (page: number) => void;
  className?: string;
  /** 커머스·어드민 공통 패턴: 활성 셀 색만 톤 전환 */
  tone?: "commerce" | "admin";
  labels?: {
    previous: string;
    next: string;
  };
};

function PageButton({
  active,
  children,
  tone,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  active?: boolean;
  tone: "commerce" | "admin";
}) {
  const activeBg =
    tone === "commerce"
      ? commerceColors.primary.main
      : commerceColors.primary.main;
  const inactiveBg = adminColors.neutral.n100;
  const activeFg = commerceColors.text.inverse;
  const inactiveFg = adminColors.text.secondary;

  return (
    <button
      type="button"
      className={cn(
        "inline-flex items-center justify-center rounded transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--admin-semantic-info)] disabled:opacity-40",
      )}
      style={{
        width: cell,
        height: cell,
        ...typo,
        backgroundColor: active ? activeBg : inactiveBg,
        color: active ? activeFg : inactiveFg,
      }}
      {...rest}
    >
      {children}
    </button>
  );
}

function visiblePageRange(
  current: number,
  total: number,
  maxVisible: number,
): number[] {
  if (total <= maxVisible) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  const half = Math.floor(maxVisible / 2);
  let start = Math.max(1, current - half);
  const end = Math.min(total, start + maxVisible - 1);
  start = Math.max(1, end - maxVisible + 1);
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  className,
  tone = "admin",
  labels = { previous: "이전 페이지", next: "다음 페이지" },
}: PaginationProps) {
  if (totalPages < 1) {
    return null;
  }

  const pages = visiblePageRange(currentPage, totalPages, 5);

  return (
    <nav
      className={cn("inline-flex items-center gap-1", className)}
      aria-label="페이지 탐색"
    >
      <PageButton
        tone={tone}
        aria-label={labels.previous}
        disabled={currentPage <= 1}
        onClick={() => onPageChange?.(currentPage - 1)}
      >
        <ChevronLeftIcon />
      </PageButton>
      {pages.map((p) => (
        <PageButton
          key={p}
          tone={tone}
          active={p === currentPage}
          aria-label={`${p}페이지`}
          aria-current={p === currentPage ? "page" : undefined}
          onClick={() => onPageChange?.(p)}
        >
          {p}
        </PageButton>
      ))}
      <PageButton
        tone={tone}
        aria-label={labels.next}
        disabled={currentPage >= totalPages}
        onClick={() => onPageChange?.(currentPage + 1)}
      >
        <ChevronRightIcon />
      </PageButton>
    </nav>
  );
}

function ChevronLeftIcon() {
  return (
    <svg width={16} height={16} viewBox="0 0 16 16" fill="none" aria-hidden>
      <path
        d="M10 12L6 8l4-4"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg width={16} height={16} viewBox="0 0 16 16" fill="none" aria-hidden>
      <path
        d="M6 4l4 4-4 4"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
