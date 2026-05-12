"use client";

import Link from "next/link";
import { cn } from "@/components/ui";
import { commerceColors } from "@/commons/constants/color";

function visibleRange(current: number, total: number, maxVisible = 5) {
  if (total <= maxVisible) return Array.from({ length: total }, (_, i) => i + 1);
  const half = Math.floor(maxVisible / 2);
  let start = Math.max(1, current - half);
  const end = Math.min(total, start + maxVisible - 1);
  start = Math.max(1, end - maxVisible + 1);
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}

function PageLink({
  href,
  active,
  label,
  children,
  disabled,
}: {
  href: string;
  active?: boolean;
  label: string;
  children: React.ReactNode;
  disabled?: boolean;
}) {
  const base = cn(
    "inline-flex h-7 w-7 items-center justify-center rounded",
    "text-[13px] leading-5",
    "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--commerce-semantic-info)",
  );

  if (disabled) {
    return (
      <span
        aria-label={label}
        className={cn(base, "opacity-50")}
        style={{ backgroundColor: commerceColors.background.light, color: commerceColors.text.muted }}
      >
        {children}
      </span>
    );
  }

  return (
    <Link
      href={href}
      aria-label={label}
      aria-current={active ? "page" : undefined}
      className={cn(
        base,
        active ? "text-white" : "",
      )}
      style={
        active
          ? { backgroundColor: commerceColors.primary.main, color: commerceColors.text.inverse }
          : { backgroundColor: commerceColors.background.light, color: commerceColors.text.secondary }
      }
    >
      {children}
    </Link>
  );
}

function ChevronLeft() {
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

function ChevronRight() {
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

export function AccountPagination({
  page,
  totalPages,
  basePath = "/account/wishlist",
}: {
  page: number;
  totalPages: number;
  basePath?: string;
}) {
  if (totalPages <= 1) return null;
  const pages = visibleRange(page, totalPages, 5);
  const mk = (p: number) => `${basePath}?page=${p}`;

  return (
    <nav className="flex items-center justify-center gap-1" aria-label="Pagination">
      <PageLink
        href={mk(Math.max(1, page - 1))}
        disabled={page <= 1}
        label="Previous page"
      >
        <ChevronLeft />
      </PageLink>
      {pages.map((p) => (
        <PageLink
          key={p}
          href={mk(p)}
          active={p === page}
          label={`${p} page`}
        >
          {p}
        </PageLink>
      ))}
      <PageLink
        href={mk(Math.min(totalPages, page + 1))}
        disabled={page >= totalPages}
        label="Next page"
      >
        <ChevronRight />
      </PageLink>
    </nav>
  );
}

