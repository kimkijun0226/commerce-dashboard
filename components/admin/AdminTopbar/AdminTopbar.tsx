"use client";

import { adminColors } from "@/commons/constants/color";
import { adminTypography } from "@/commons/constants/typography";
import { cn, typographyToStyle } from "@/components/ui";
import type { ReactNode } from "react";

export type AdminTopbarProps = {
  title: ReactNode;
  description?: ReactNode;
  actionsSlot?: ReactNode;
  className?: string;
};

export function AdminTopbar({
  title,
  description,
  actionsSlot,
  className,
}: AdminTopbarProps) {
  return (
    <header
      className={cn("flex flex-wrap items-start justify-between gap-4", className)}
      aria-label="상단 바"
    >
      <div className="min-w-0">
        <div
          style={{
            ...typographyToStyle(adminTypography.cardTitle),
            color: adminColors.text.primary,
          }}
        >
          {title}
        </div>
        {description ? (
          <div
            className="mt-1"
            style={{
              ...typographyToStyle(adminTypography.cardDescription),
              color: adminColors.text.muted,
            }}
          >
            {description}
          </div>
        ) : null}
      </div>
      {actionsSlot ? <div className="shrink-0">{actionsSlot}</div> : null}
    </header>
  );
}

