import { adminColors, commerceColors } from "@/commons/constants/color";
import { cn } from "@/components/ui/cn";
import type { HTMLAttributes } from "react";

export type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  variant?: "default" | "success" | "warning" | "danger" | "outline";
  size?: "sm" | "md";
};

const sizeClasses = {
  sm: "min-h-[18px] px-1.5 text-[11px] leading-[14px]",
  md: "min-h-[22px] px-2 text-xs leading-4",
} as const;

export function Badge({
  variant = "default",
  size = "md",
  className,
  children,
  style,
  ...rest
}: BadgeProps) {
  const palette = {
    default: {
      bg: adminColors.neutral.n200,
      fg: adminColors.text.primary,
      border: "transparent",
    },
    success: {
      bg: `${commerceColors.semantic.success}1f`,
      fg: commerceColors.semantic.success,
      border: "transparent",
    },
    warning: {
      bg: `${commerceColors.semantic.warning}33`,
      fg: adminColors.neutral.n800,
      border: "transparent",
    },
    danger: {
      bg: `${commerceColors.semantic.danger}1f`,
      fg: commerceColors.semantic.danger,
      border: "transparent",
    },
    outline: {
      bg: "transparent",
      fg: adminColors.text.primary,
      border: adminColors.border.default,
    },
  } as const;

  const t = palette[variant];

  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-full font-semibold tabular-nums",
        sizeClasses[size],
        variant === "outline" && "border",
        className,
      )}
      style={{
        backgroundColor: t.bg,
        color: t.fg,
        borderColor: t.border,
        fontFamily: "var(--commerce-font-body)",
        ...style,
      }}
      {...rest}
    >
      {children}
    </span>
  );
}
