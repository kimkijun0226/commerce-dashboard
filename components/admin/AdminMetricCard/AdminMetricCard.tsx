"use client";

import { adminColors } from "@/commons/constants/color";
import { adminTypography } from "@/commons/constants/typography";
import { cn, typographyToStyle } from "@/components/ui";
import type { ReactNode } from "react";

export type AdminMetricCardProps = {
  title: ReactNode;
  value: ReactNode;
  trend?: {
    direction: "up" | "down" | "flat";
    label: ReactNode;
  };
  icon?: ReactNode;
  className?: string;
};

export function AdminMetricCard({
  title,
  value,
  trend,
  icon,
  className,
}: AdminMetricCardProps) {
  const trendColor =
    trend?.direction === "up"
      ? adminColors.semantic.success
      : trend?.direction === "down"
        ? adminColors.semantic.danger
        : adminColors.text.secondary;

  return (
    <section
      className={cn("rounded-xl border bg-white p-5", className)}
      style={{ borderColor: adminColors.border.default }}
      aria-label={typeof title === "string" ? title : "지표 카드"}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div
            style={{
              ...typographyToStyle(adminTypography.cardDescription),
              color: adminColors.text.secondary,
            }}
          >
            {title}
          </div>
          <div
            className="mt-1"
            style={{
              ...typographyToStyle(adminTypography.cardTitle),
              color: adminColors.text.primary,
            }}
          >
            {value}
          </div>
          {trend ? (
            <div
              className="mt-2"
              style={{
                ...typographyToStyle(adminTypography.helperText),
                color: trendColor,
              }}
            >
              {trend.label}
            </div>
          ) : null}
        </div>

        {icon ? (
          <div
            className="flex size-10 items-center justify-center rounded-lg"
            style={{ backgroundColor: adminColors.neutral.n100 }}
            aria-hidden
          >
            {icon}
          </div>
        ) : null}
      </div>
    </section>
  );
}

