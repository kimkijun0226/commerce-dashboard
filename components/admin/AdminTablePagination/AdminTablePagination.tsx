"use client";

import { adminColors } from "@/commons/constants/color";
import { adminTypography } from "@/commons/constants/typography";
import { cn, typographyToStyle } from "@/components/ui";
import type { AdminSelectOption } from "@/components/admin/types";
import { AdminSelect } from "../AdminSelect/AdminSelect";
import type { ButtonHTMLAttributes } from "react";

const cell = 28;
const typo = typographyToStyle(adminTypography.pagination);

export type AdminTablePaginationProps = {
  currentPage: number;
  totalPages: number;
  onPageChange?: (page: number) => void;

  pageSize?: string;
  pageSizeOptions?: readonly AdminSelectOption[];
  onPageSizeChange?: (value: string) => void;

  totalLabel?: string; // ex) "of 50"
  className?: string;
};

function PageButton({
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
        ...typo,
        backgroundColor: active ? adminColors.neutral.n900 : adminColors.neutral.n100,
        color: active ? "#ffffff" : adminColors.text.secondary,
      }}
      {...rest}
    >
      {children}
    </button>
  );
}

function visiblePageRange(current: number, total: number, maxVisible: number) {
  if (total <= maxVisible) return Array.from({ length: total }, (_, i) => i + 1);
  const half = Math.floor(maxVisible / 2);
  let start = Math.max(1, current - half);
  const end = Math.min(total, start + maxVisible - 1);
  start = Math.max(1, end - maxVisible + 1);
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}

export function AdminTablePagination({
  currentPage,
  totalPages,
  onPageChange,
  pageSize,
  pageSizeOptions,
  onPageSizeChange,
  totalLabel,
  className,
}: AdminTablePaginationProps) {
  if (totalPages < 1) return null;

  const pages = visiblePageRange(currentPage, totalPages, 5);

  return (
    <div className={cn("flex flex-wrap items-center justify-between gap-4", className)}>
      <div className="flex items-center gap-2">
        <span style={{ ...typographyToStyle(adminTypography.menuItem), color: adminColors.text.secondary }}>
          Showing
        </span>
        {pageSizeOptions && pageSizeOptions.length > 0 ? (
          <div className="w-[78px]">
            <AdminSelect
              aria-label="페이지 크기"
              options={pageSizeOptions}
              value={pageSize}
              onChange={(v) => onPageSizeChange?.(v)}
            />
          </div>
        ) : null}
        {totalLabel ? (
          <span style={{ ...typographyToStyle(adminTypography.menuItem), color: adminColors.text.secondary }}>
            {totalLabel}
          </span>
        ) : null}
      </div>

      <nav className="inline-flex items-center gap-1" aria-label="페이지 탐색">
        <PageButton
          aria-label="이전 페이지"
          disabled={currentPage <= 1}
          onClick={() => onPageChange?.(currentPage - 1)}
        >
          <ChevronLeftIcon />
        </PageButton>
        {pages.map((p) => (
          <PageButton
            key={p}
            active={p === currentPage}
            aria-label={`${p}페이지`}
            aria-current={p === currentPage ? "page" : undefined}
            onClick={() => onPageChange?.(p)}
          >
            {p}
          </PageButton>
        ))}
        <PageButton
          aria-label="다음 페이지"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange?.(currentPage + 1)}
        >
          <ChevronRightIcon />
        </PageButton>
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

