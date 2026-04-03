import { commerceColors } from "@/commons/constants/color";
import { commerceTypography } from "@/commons/constants/typography";
import { cn } from "@/components/ui/cn";
import { typographyToStyle } from "@/components/ui/typography-styles";
import type { ButtonHTMLAttributes, ReactNode } from "react";

const sizeHeights = { sm: 40, md: 48, lg: 52 } as const;
const sizeTypography = {
  sm: commerceTypography.buttonS,
  md: commerceTypography.buttonS,
  lg: commerceTypography.buttonM,
} as const;

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "outline";
  size?: keyof typeof sizeHeights;
  shape?: "rounded" | "pill";
  loading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
};

export function Button({
  variant = "primary",
  size = "md",
  shape = "rounded",
  loading = false,
  leftIcon,
  rightIcon,
  className,
  disabled,
  children,
  type = "button",
  ...rest
}: ButtonProps) {
  const height = sizeHeights[size];
  const typo = typographyToStyle(sizeTypography[size]);
  const isDisabled = disabled || loading;

  const base =
    "box-border inline-flex items-center justify-center gap-2 font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:pointer-events-none disabled:opacity-50";
  const focusRing =
    variant === "primary"
      ? "focus-visible:outline-[var(--commerce-semantic-info)]"
      : "focus-visible:outline-[var(--commerce-primary-main)]";

  const shapeClass = shape === "pill" ? "rounded-full px-6" : "rounded-lg px-5";

  const variantStyle =
    variant === "primary"
      ? {
          backgroundColor: commerceColors.primary.main,
          color: commerceColors.text.inverse,
        }
      : {
          backgroundColor: "transparent",
          color: commerceColors.text.primary,
          borderWidth: 1,
          borderStyle: "solid" as const,
          borderColor: commerceColors.primary.main,
        };

  return (
    <button
      type={type}
      disabled={isDisabled}
      className={cn(base, focusRing, shapeClass, className)}
      style={{
        minHeight: height,
        ...typo,
        ...variantStyle,
      }}
      aria-busy={loading || undefined}
      {...rest}
    >
      {loading ? (
        <span
          className="size-4 shrink-0 animate-spin rounded-full border-2 border-current border-t-transparent"
          aria-hidden
        />
      ) : (
        leftIcon
      )}
      {children}
      {!loading && rightIcon}
    </button>
  );
}
