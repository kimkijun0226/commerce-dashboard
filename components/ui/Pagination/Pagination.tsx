"use client";

import { adminColors } from "@/commons/constants/color";
import { adminTypography } from "@/commons/constants/typography";
import { cn } from "../cn/cn";
import { typographyToStyle } from "../typography-styles/typography-styles";
import type { ButtonHTMLAttributes, SelectHTMLAttributes } from "react";
import { useId } from "react";

const cell = 28;

/** Figma 커머스·어드민 공통 페이지네이션 톤 */
const activeBg = "#141718";
const idleBg = "#f1f2f6";
const muted = "#8b909a";

export type PageSizeOption = { value: string; label: string };

export type PaginationProps = {
  page: number;
  total: number;
  onPageChange?: (next: number) => void;
  pageSize?: string;
  pageSizeOptions?: readonly PageSizeOption[];
  onPageSizeChange?: (value: string) => void;
  totalLabel?: string;
  /** 기본값 `Showing` (어드민 테이블 하단과 동일) */
  summaryPrefix?: string;
  className?: string;
};

const typoPage = typographyToStyle(adminTypography.pagination);
const typoSummary = typographyToStyle(adminTypography.menuItem);

function visiblePageRange(current: number, pageCount: number, maxVisible: number) {
  if (pageCount <= maxVisible) return Array.from({ length: pageCount }, (_, i) => i + 1);
  const half = Math.floor(maxVisible / 2);
  let start = Math.max(1, current - half);
  const end = Math.min(pageCount, start + maxVisible - 1);
  start = Math.max(1, end - maxVisible + 1);
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}

function PageBtn({
  active,
  children,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { active?: boolean }) {
  return (
    <button
      type="button"
      className={cn(
        "inline-flex items-center justify-center rounded transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--admin-semantic-info)] disabled:opacity-40",
      )}
      style={{
        width: cell,
        height: cell,
        ...typoPage,
        backgroundColor: active ? activeBg : idleBg,
        color: active ? "#ffffff" : muted,
      }}
      {...rest}
    >
      {children}
    </button>
  );
}

function PageSizeSelect({
  options,
  value,
  onChange,
  "aria-label": ariaLabel,
  id,
}: Pick<SelectHTMLAttributes<HTMLSelectElement>, "aria-label" | "id"> & {
  options: readonly PageSizeOption[];
  value?: string;
  onChange?: (v: string) => void;
}) {
  const typo = typographyToStyle(adminTypography.tableCell);
  return (
    <div className="relative w-[78px]">
      <select
        id={id}
        value={value}
        className={cn(
          "h-[38px] w-full appearance-none rounded-md border bg-white py-0 pr-8 pl-2 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--admin-semantic-info)] disabled:opacity-60",
        )}
        style={{
          borderColor: adminColors.border.brandSubtle,
          color: adminColors.text.primary,
          ...typo,
        }}
        aria-label={ariaLabel ?? "페이지 크기"}
        onChange={(e) => onChange?.(e.currentTarget.value)}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <span
        className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2"
        aria-hidden
        style={{ color: adminColors.text.secondary }}
      >
        <ChevronDownIcon />
      </span>
    </div>
  );
}

export function Pagination({
  page,
  total,
  onPageChange,
  pageSize,
  pageSizeOptions,
  onPageSizeChange,
  totalLabel,
  summaryPrefix = "Showing",
  className,
}: PaginationProps) {
  const selectId = useId();
  if (total < 1) return null;

  const pages = visiblePageRange(page, total, 5);
  const showSummary =
    (pageSizeOptions && pageSizeOptions.length > 0) || Boolean(totalLabel);

  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-4",
        showSummary ? "justify-between" : "justify-end",
        className,
      )}
    >
      {showSummary ? (
        <div className="flex items-center gap-2">
          <span style={{ ...typoSummary, color: adminColors.text.secondary }}>{summaryPrefix}</span>
          {pageSizeOptions && pageSizeOptions.length > 0 ? (
            <PageSizeSelect
              id={selectId}
              options={pageSizeOptions}
              value={pageSize}
              onChange={onPageSizeChange}
            />
          ) : null}
          {totalLabel ? (
            <span style={{ ...typoSummary, color: adminColors.text.secondary }}>{totalLabel}</span>
          ) : null}
        </div>
      ) : null}

      <nav className="inline-flex items-center gap-1" aria-label="페이지 탐색">
        <PageBtn
          aria-label="이전 페이지"
          disabled={page <= 1}
          onClick={() => onPageChange?.(page - 1)}
        >
          <ChevronLeftIcon />
        </PageBtn>
        {pages.map((p) => (
          <PageBtn
            key={p}
            active={p === page}
            aria-label={`${p}페이지`}
            aria-current={p === page ? "page" : undefined}
            onClick={() => onPageChange?.(p)}
          >
            {p}
          </PageBtn>
        ))}
        <PageBtn
          aria-label="다음 페이지"
          disabled={page >= total}
          onClick={() => onPageChange?.(page + 1)}
        >
          <ChevronRightIcon />
        </PageBtn>
      </nav>
    </div>
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

function ChevronDownIcon() {
  return (
    <svg width={16} height={16} viewBox="0 0 16 16" fill="none">
      <path
        d="M4 6l4 4 4-4"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
