"use client";

import { commerceColors } from "@/commons/constants/color";
import { commerceTypography } from "@/commons/constants/typography";
import { cn } from "@/components/ui/cn";
import { typographyToStyle } from "@/components/ui/typography-styles";
import type { HTMLAttributes } from "react";

export type QuantityStepperProps = HTMLAttributes<HTMLDivElement> & {
  value: number;
  min?: number;
  max?: number;
  onChange: (next: number) => void;
  disabled?: boolean;
  size?: "sm" | "md";
};

export function QuantityStepper({
  value,
  min = 1,
  max = 99,
  onChange,
  disabled,
  size = "md",
  className,
  ...rest
}: QuantityStepperProps) {
  const isSm = size === "sm";
  const height = isSm ? 32 : 52;
  const iconBox = isSm ? 16 : 20;
  const textTypo = typographyToStyle(
    isSm ? commerceTypography.caption2Semi : commerceTypography.body2Semi,
  );

  const dec = () => onChange(Math.max(min, value - 1));
  const inc = () => onChange(Math.min(max, value + 1));

  const atMin = value <= min;
  const atMax = value >= max;

  return (
    <div
      role="group"
      aria-label="수량"
      className={cn("inline-flex items-stretch rounded-lg", className)}
      style={{
        height,
        backgroundColor: isSm ? "transparent" : commerceColors.background.light,
        borderWidth: 1,
        borderStyle: "solid",
        borderColor: commerceColors.border.strong,
      }}
      {...rest}
    >
      <button
        type="button"
        aria-label="수량 감소"
        disabled={disabled || atMin}
        className="flex items-center justify-center px-2 transition-opacity focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--commerce-semantic-info)] disabled:cursor-not-allowed disabled:opacity-40"
        onClick={dec}
      >
        <MinusIcon size={iconBox} />
      </button>
      <span
        className="flex min-w-[2rem] items-center justify-center tabular-nums"
        style={{
          ...textTypo,
          color: commerceColors.primary.dark,
        }}
      >
        {value}
      </span>
      <button
        type="button"
        aria-label="수량 증가"
        disabled={disabled || atMax}
        className="flex items-center justify-center px-2 transition-opacity focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--commerce-semantic-info)] disabled:cursor-not-allowed disabled:opacity-40"
        onClick={inc}
      >
        <PlusIcon size={iconBox} />
      </button>
    </div>
  );
}

function MinusIcon({ size }: { size: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
    >
      <path
        d="M6 12h12"
        stroke={commerceColors.primary.dark}
        strokeWidth={2}
        strokeLinecap="round"
      />
    </svg>
  );
}

function PlusIcon({ size }: { size: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
    >
      <path
        d="M12 6v12M6 12h12"
        stroke={commerceColors.primary.dark}
        strokeWidth={2}
        strokeLinecap="round"
      />
    </svg>
  );
}
