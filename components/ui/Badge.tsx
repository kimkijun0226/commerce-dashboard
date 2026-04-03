import { adminColors } from "@/commons/constants/color";
import { adminTypography } from "@/commons/constants/typography";
import { cn } from "@/components/ui/cn";
import { typographyToStyle } from "@/components/ui/typography-styles";
import type { HTMLAttributes } from "react";

export type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  variant?: "brand" | "success" | "neutral";
};

export function Badge({
  variant = "brand",
  className,
  children,
  ...rest
}: BadgeProps) {
  const bgTint =
    variant === "brand"
      ? adminColors.brand.primary
      : variant === "success"
        ? adminColors.semantic.success
        : adminColors.neutral.n200;

  const textColor =
    variant === "brand"
      ? adminColors.brand.primary
      : variant === "success"
        ? adminColors.semantic.success
        : adminColors.text.primary;

  return (
    <span
      className={cn(
        "inline-flex min-h-[22px] min-w-[22px] items-center justify-center rounded-full px-1.5 tabular-nums",
        className,
      )}
      style={{
        backgroundColor:
          variant === "brand" ? `${bgTint}29` : `${bgTint}40`,
        color: textColor,
        ...typographyToStyle({
          ...adminTypography.pagination,
          fontWeight: 600,
          fontSize: 11,
          lineHeightPx: 14,
        }),
      }}
      {...rest}
    >
      {children}
    </span>
  );
}
