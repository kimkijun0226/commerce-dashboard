"use client";

import { adminColors } from "@/commons/constants/color";
import { adminTypography } from "@/commons/constants/typography";
import { cn, typographyToStyle } from "@/components/ui";
import type { ReactNode } from "react";
import { AdminToggleSwitch } from "../AdminToggleSwitch/AdminToggleSwitch";

export type AdminSettingsCardProps = {
  title: ReactNode;
  description?: ReactNode;
  icon?: ReactNode;

  enabled: boolean;
  onEnabledChange?: (next: boolean) => void;

  children?: ReactNode;
  disabled?: boolean;
  className?: string;
};

/**
 * Figma(310:2924) "실시간 매출 알림" 카드 패턴.
 * - 레이아웃/토큰/접근성 중심, 내부 필드는 children 슬롯으로 주입
 */
export function AdminSettingsCard({
  title,
  description,
  icon,
  enabled,
  onEnabledChange,
  children,
  disabled,
  className,
}: AdminSettingsCardProps) {
  return (
    <section
      className={cn("rounded-xl border bg-white p-6", className)}
      style={{ borderColor: adminColors.border.default }}
      aria-label={typeof title === "string" ? title : "설정 카드"}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-3">
          {icon ? (
            <div
              className="flex size-10 items-center justify-center rounded-lg"
              style={{ backgroundColor: "#eff6ff", color: "#2563eb" }}
              aria-hidden
            >
              {icon}
            </div>
          ) : null}

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
        </div>

        <AdminToggleSwitch
          checked={enabled}
          onCheckedChange={onEnabledChange}
          disabled={disabled}
          aria-label="설정 토글"
        />
      </div>

      {children ? (
        <div className={cn("mt-6", disabled && "opacity-60")}>{children}</div>
      ) : null}
    </section>
  );
}

