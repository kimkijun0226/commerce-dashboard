import { adminColors, commerceColors } from "@/commons/constants/color";
import { commerceTypography } from "@/commons/constants/typography";
import { cn } from "@/components/ui/cn";
import { typographyToStyle } from "@/components/ui/typography-styles";
import type { ButtonHTMLAttributes, CSSProperties, ReactNode } from "react";

const heights = { sm: 36, md: 40, lg: 48 } as const;
const sizeTypography = {
  sm: commerceTypography.buttonXS,
  md: commerceTypography.buttonS,
  lg: commerceTypography.buttonM,
} as const;

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: keyof typeof heights;
  loading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
};

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  leftIcon,
  rightIcon,
  className,
  disabled,
  children,
  type = "button",
  style,
  ...rest
}: ButtonProps) {
  const h = heights[size];
  const typo = typographyToStyle(sizeTypography[size]);
  const isDisabled = disabled || loading;

  const base =
    "box-border inline-flex items-center justify-center gap-2 rounded-lg px-4 font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--commerce-semantic-info)] disabled:pointer-events-none disabled:opacity-50";

  const variantStyles: Record<
    NonNullable<ButtonProps["variant"]>,
    CSSProperties
  > = {
    primary: {
      backgroundColor: commerceColors.primary.main,
      color: commerceColors.text.inverse,
      borderWidth: 0,
    },
    secondary: {
      backgroundColor: adminColors.neutral.n100,
      color: adminColors.text.primary,
      borderWidth: 1,
      borderStyle: "solid",
      borderColor: adminColors.border.default,
    },
    ghost: {
      backgroundColor: "transparent",
      color: commerceColors.text.primary,
      borderWidth: 0,
    },
    danger: {
      backgroundColor: commerceColors.semantic.danger,
      color: commerceColors.text.inverse,
      borderWidth: 0,
    },
  };

  return (
    <button
      type={type}
      disabled={isDisabled}
      className={cn(
        base,
        variant === "ghost" && "hover:bg-[var(--admin-neutral-n100)]",
        className,
      )}
      style={{
        minHeight: h,
        ...typo,
        ...variantStyles[variant],
        ...style,
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
