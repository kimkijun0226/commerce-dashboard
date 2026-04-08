"use client";

import { adminColors } from "@/commons/constants/color";
import { adminTypography } from "@/commons/constants/typography";
import type { AdminSidebarItem } from "@/components/admin/types";
import { cn, typographyToStyle } from "@/components/ui";
import { AdminSidebarNavItem } from "../AdminSidebarNavItem/AdminSidebarNavItem";
import type { MouseEvent, ReactNode } from "react";

export type AdminSidebarSection = {
  id: string;
  label: string;
  items: readonly AdminSidebarItem[];
};

export type AdminSidebarProps = {
  brand?: ReactNode;
  onToggleCollapse?: () => void;
  sections: readonly AdminSidebarSection[];
  className?: string;
};

export function AdminSidebar({
  brand = "Cursor Commerce",
  onToggleCollapse,
  sections,
  className,
}: AdminSidebarProps) {
  return (
    <aside
      className={cn("w-[260px] shrink-0 border-r bg-white", className)}
      style={{ borderColor: adminColors.border.default }}
      aria-label="관리자 사이드바"
    >
      <div className="flex h-16 items-center justify-between px-4">
        <div
          style={{
            fontFamily: "var(--admin-font-heading)",
            ...typographyToStyle(adminTypography.cardTitle),
            color: adminColors.text.primary,
          }}
        >
          {brand}
        </div>
        {onToggleCollapse ? (
          <button
            type="button"
            className="rounded p-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--admin-semantic-info)]"
            onClick={onToggleCollapse}
            aria-label="사이드바 접기/펼치기"
          >
            <CollapseIcon />
          </button>
        ) : null}
      </div>

      <nav className="px-3 py-2" aria-label="관리자 메뉴">
        {sections.map((sec) => (
          <div key={sec.id} className="mb-4">
            <div
              className="px-3 py-2"
              style={{
                ...typographyToStyle(adminTypography.menuSectionLabel),
                color: adminColors.text.secondary,
              }}
            >
              {sec.label}
            </div>
            <div className="space-y-2">
              {sec.items.map((it) => (
                <AdminSidebarNavItem
                  key={it.key}
                  href={it.href ?? "#"}
                  active={it.active}
                  icon={it.icon}
                  badge={it.badge}
                  label={it.label}
                  aria-disabled={it.disabled || undefined}
                  onClick={(e: MouseEvent<HTMLAnchorElement>) => {
                    if (it.disabled) e.preventDefault();
                  }}
                  className={it.disabled ? "pointer-events-none opacity-60" : undefined}
                />
              ))}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  );
}

function CollapseIcon() {
  return (
    <svg width={24} height={24} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M7 7h10M7 12h10M7 17h10"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
      />
    </svg>
  );
}

