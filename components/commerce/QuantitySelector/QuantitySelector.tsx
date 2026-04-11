"use client";

import { commerceColors } from "@/commons/constants/color";
import { commerceTypography } from "@/commons/constants/typography";
import { cn, typographyToStyle } from "@/components/ui";
import type { HTMLAttributes } from "react";

/** Figma: 카트 소형(32·보더 #6c7275·r4) vs PDP/루프(52·fill #f5f5f5·r8·아이콘 20) */
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
  /**
   * product 전용: PDP 1열(127px) 그리드 — 좌·우 42px 히트영역 + 중앙 숫자 구역
   * 미지정 시 카드 등에서 기존 가변 폭 레이아웃 유지
   */
  productLayout?: "default" | "compact";
  className?: string;
};

const PRODUCT_LOOP_BG = "#f5f5f5";

const stepperFocus =
  "focus-visible:relative focus-visible:z-10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[var(--commerce-semantic-info)]";

export function QuantitySelector({
  value,
  min = 1,
  max = 99,
  onChange,
  disabled,
  variant = "cart",
  productLayout = "default",
  className,
  ...rest
}: QuantitySelectorProps) {
  const isCart = variant === "cart";
  const isProductCompact = !isCart && productLayout === "compact";
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

  const digitColor = isCart
    ? commerceColors.primary.dark
    : commerceColors.primary.main;

  return (
    <div
      role="group"
      aria-label="수량"
      className={cn(
        "inline-flex items-stretch",
        isProductCompact && "w-full min-w-[127px] max-w-[127px] overflow-hidden",
        className,
      )}
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
        className={cn(
          "flex items-center justify-center transition-[background-color,opacity] duration-200 ease-out",
          "disabled:cursor-not-allowed disabled:opacity-40",
          isProductCompact ? "w-[42px] shrink-0" : "px-2",
          !isCart &&
            "enabled:hover:bg-black/6 enabled:active:bg-black/10",
          isCart &&
            "enabled:hover:bg-[rgba(19,24,27,0.05)] enabled:active:bg-[rgba(19,24,27,0.08)]",
          stepperFocus,
        )}
        onClick={dec}
      >
        <MinusIcon size={iconBox} subtle={isCart} />
      </button>
      <span
        className={cn(
          "flex items-center justify-center tabular-nums select-none",
          isProductCompact
            ? "min-w-[43px] flex-1"
            : isCart
              ? "min-w-8"
              : "min-w-8 flex-1 px-1",
        )}
        style={{
          ...textTypo,
          color: digitColor,
        }}
      >
        {value}
      </span>
      <button
        type="button"
        aria-label="수량 증가"
        disabled={disabled || atMax}
        className={cn(
          "flex items-center justify-center transition-[background-color,opacity] duration-200 ease-out",
          "disabled:cursor-not-allowed disabled:opacity-40",
          isProductCompact ? "w-[42px] shrink-0" : "px-2",
          !isCart &&
            "enabled:hover:bg-black/6 enabled:active:bg-black/10",
          isCart &&
            "enabled:hover:bg-[rgba(19,24,27,0.05)] enabled:active:bg-[rgba(19,24,27,0.08)]",
          stepperFocus,
        )}
        onClick={inc}
      >
        <PlusIcon size={iconBox} subtle={isCart} />
      </button>
    </div>
  );
}

function MinusIcon({ size, subtle }: { size: number; subtle?: boolean }) {
  const stroke = subtle
    ? commerceColors.border.strong
    : commerceColors.primary.main;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M6 12h12"
        stroke={stroke}
        strokeWidth={subtle ? 1.75 : 2}
        strokeLinecap="round"
      />
    </svg>
  );
}

function PlusIcon({ size, subtle }: { size: number; subtle?: boolean }) {
  const stroke = subtle
    ? commerceColors.border.strong
    : commerceColors.primary.main;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 6v12M6 12h12"
        stroke={stroke}
        strokeWidth={subtle ? 1.75 : 2}
        strokeLinecap="round"
      />
    </svg>
  );
}
