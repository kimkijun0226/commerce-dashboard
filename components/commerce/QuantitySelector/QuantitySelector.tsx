"use client";

import { commerceColors } from "@/commons/constants/color";
import { commerceTypography } from "@/commons/constants/typography";
import { cn, typographyToStyle } from "@/components/ui";
import type { HTMLAttributes } from "react";

/** Figma: 카트 소형(32·보더) vs PDP/루프(52·#f5f5f5) */
export type QuantitySelectorProps = Omit<
  HTMLAttributes<HTMLDivElement>,
  "onChange"
> & {
  value: number;
  min?: number;
  max?: number;
  onChange: (next: number) => void;
  disabled?: boolean;
  variant?: "cart" | "product";
  className?: string;
};

const PRODUCT_LOOP_BG = "#f5f5f5";

export function QuantitySelector({
  value,
  min = 1,
  max = 99,
  onChange,
  disabled,
  variant = "cart",
  className,
  ...rest
}: QuantitySelectorProps) {
  const isCart = variant === "cart";
  const height = isCart ? 32 : 52;
  const iconBox = isCart ? 16 : 20;
  const radius = isCart ? 4 : 8;
  const textTypo = typographyToStyle(
    isCart ? commerceTypography.caption2Semi : commerceTypography.body2Semi,
  );

  const dec = () => onChange(Math.max(min, value - 1));
  const inc = () => onChange(Math.min(max, value + 1));
  const atMin = value <= min;
  const atMax = value >= max;

  return (
    <div
      role="group"
      aria-label="수량"
      className={cn("inline-flex items-stretch", className)}
      style={{
        height,
        borderRadius: radius,
        backgroundColor: isCart ? "transparent" : PRODUCT_LOOP_BG,
        borderWidth: isCart ? 1 : 0,
        borderStyle: "solid",
        borderColor: isCart ? commerceColors.border.strong : "transparent",
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
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
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
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 6v12M6 12h12"
        stroke={commerceColors.primary.dark}
        strokeWidth={2}
        strokeLinecap="round"
      />
    </svg>
  );
}
