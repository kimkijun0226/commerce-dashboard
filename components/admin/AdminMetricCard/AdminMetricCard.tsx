import "../admin.css";
import React, { type ReactNode } from "react";
import { cn } from "@/components/ui";
export type AdminMetricCardProps = {
  title: ReactNode;
  value: ReactNode;
  trend?: { direction: "up" | "down" | "flat"; label: ReactNode };
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
  return (
    <section
      className={cn("admin-metric-card", className)}
      aria-label={typeof title === "string" ? title : "지표 카드"}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="admin-metric-title">{title}</div>
        {icon && (
          <span className="admin-metric-icon" aria-hidden>
            {icon}
          </span>
        )}
      </div>
      <div className="admin-metric-value">{value}</div>
      {trend && (
        <div
          className="admin-metric-trend"
          style={
            trend.direction === "flat"
              ? undefined
              : {
                  color: `var(--admin-semantic-${trend.direction === "up" ? "success" : "danger"})`,
                }
          }
        >
          {trend.label}
        </div>
      )}
    </section>
  );
}
