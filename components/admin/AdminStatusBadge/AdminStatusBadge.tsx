import { adminColors } from "@/commons/constants/color";
import { adminTypography } from "@/commons/constants/typography";
import { cn, typographyToStyle } from "@/components/ui";
import type { HTMLAttributes } from "react";

export type AdminStatusBadgeProps = HTMLAttributes<HTMLSpanElement> & {
  variant?: "success" | "warning" | "danger" | "info" | "neutral";
  size?: "sm" | "md";
};

const sizeClasses = {
  sm: "min-h-[20px] px-2 text-xs leading-5",
  md: "min-h-[22px] px-2.5 text-sm leading-6",
} as const;

export function AdminStatusBadge({
  variant = "neutral",
  size = "sm",
  className,
  style,
  children,
  ...rest
}: AdminStatusBadgeProps) {
  const palette = {
    success: { fg: adminColors.semantic.success, bg: `${adminColors.semantic.success}1f` },
    warning: { fg: adminColors.semantic.warning, bg: `${adminColors.semantic.warning}1f` },
    danger: { fg: adminColors.semantic.danger, bg: `${adminColors.semantic.danger}1f` },
    info: { fg: adminColors.semantic.info, bg: `${adminColors.semantic.info}1f` },
    neutral: { fg: adminColors.text.secondary, bg: adminColors.neutral.n100 },
  } as const;

  const t = palette[variant];

  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-full font-medium",
        sizeClasses[size],
        className,
      )}
      style={{
        ...typographyToStyle(adminTypography.tableCell),
        color: t.fg,
        backgroundColor: t.bg,
        ...style,
      }}
      {...rest}
    >
      {children}
    </span>
  );
}

