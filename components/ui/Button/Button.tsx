import { adminColors, commerceColors } from "@/commons/constants/color";
import { commerceTypography } from "@/commons/constants/typography";
import { cn } from "../cn/cn";
import { typographyToStyle } from "../typography-styles/typography-styles";
import { forwardRef } from "react";
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

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
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
  },
  ref,
) {
  const h = heights[size];
  const typo = typographyToStyle(sizeTypography[size]);
  const isDisabled = disabled || loading;

  const base =
    "box-border inline-flex transform-gpu cursor-pointer select-none items-center justify-center gap-2 rounded-lg px-4 font-medium " +
    "transition-[transform,box-shadow,opacity,background-color,color,border-color] duration-200 ease-out motion-reduce:transition-none " +
    "enabled:hover:scale-[1.02] enabled:active:scale-[0.98] motion-reduce:hover:scale-100 motion-reduce:active:scale-100 " +
    "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--commerce-semantic-info)] " +
    "disabled:cursor-not-allowed disabled:opacity-50 " +
    (loading ? "pointer-events-none cursor-wait " : "");

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
      ref={ref}
      type={type}
      disabled={isDisabled}
      className={cn(
        base,
        variant === "primary" &&
          "enabled:hover:shadow-md enabled:hover:opacity-[0.92]",
        variant === "secondary" &&
          "enabled:hover:bg-white enabled:hover:shadow-sm enabled:hover:border-(--commerce-border-strong)",
        variant === "ghost" &&
          "enabled:hover:bg-[var(--admin-neutral-n100)]",
        variant === "danger" &&
          "enabled:hover:opacity-[0.92] enabled:hover:shadow-md",
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
});
