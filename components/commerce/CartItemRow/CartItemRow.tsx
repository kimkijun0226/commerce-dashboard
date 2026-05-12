"use client";

import { commerceColors } from "@/commons/constants/color";
import { commerceTypography } from "@/commons/constants/typography";
import { cn, typographyToStyle } from "@/components/ui";
import { QuantitySelector } from "../QuantitySelector/QuantitySelector";
import Image from "next/image";
import { FiX } from "react-icons/fi";

export type CartItemRowProps = {
  name: string;
  imageUrl?: string;
  variantLabel?: string;
  quantity: number;
  unitPrice: number;
  lineTotal?: number;
  currency?: string;
  onQuantityChange?: (n: number) => void;
  onRemove?: () => void;
  disabled?: boolean;
  className?: string;
};

function formatMoney(n: number, currency = "₩") {
  return `${currency}${n.toLocaleString("ko-KR")}`;
}

export function CartItemRow({
  name,
  imageUrl,
  variantLabel,
  quantity,
  unitPrice,
  lineTotal,
  currency = "₩",
  onQuantityChange,
  onRemove,
  disabled,
  className,
}: CartItemRowProps) {
  const total =
    lineTotal !== undefined ? lineTotal : Math.round(unitPrice * quantity);

  return (
    <div
      className={cn(
        "grid gap-4 border-b border-[var(--commerce-border-subtle)] py-6 last:border-b-0",
        "sm:min-h-36 sm:grid-cols-[minmax(0,1fr)_80px_90px_96px] sm:items-center sm:gap-x-5",
        className,
      )}
    >
      <div className="flex min-w-0 gap-4">
        <div className="relative h-24 w-20 shrink-0 overflow-hidden bg-[var(--commerce-background-light)]">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={name}
              fill
              unoptimized={
                imageUrl.startsWith("http://") ||
                imageUrl.startsWith("https://")
              }
              className="object-cover"
              sizes="80px"
            />
          ) : null}
        </div>

        <div className="min-w-0 flex-1">
          <p
            className="line-clamp-2"
            style={{
              ...typographyToStyle(commerceTypography.caption1Semi),
              color: commerceColors.text.primary,
            }}
          >
            {name}
          </p>
          {variantLabel ? (
            <p
              className="mt-1"
              style={{
                ...typographyToStyle(commerceTypography.caption2),
                color: commerceColors.text.secondary,
              }}
            >
              {variantLabel}
            </p>
          ) : null}
          {onRemove ? (
            <button
              type="button"
              className={cn(
                "mt-2 inline-flex items-center gap-1 rounded-sm text-left",
                "cursor-pointer transition-colors hover:text-(--commerce-primary-main)",
                "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--commerce-semantic-info)",
                "disabled:cursor-not-allowed disabled:opacity-50",
              )}
              style={{
                ...typographyToStyle(commerceTypography.caption1Semi),
                color: commerceColors.text.secondary,
              }}
              onClick={onRemove}
              disabled={disabled}
            >
              <FiX className="size-4" aria-hidden />
              <span>Remove</span>
            </button>
          ) : null}
        </div>
      </div>

      <div className="flex items-center justify-between gap-4 sm:flex sm:justify-center">
        <span
          className="sm:hidden"
          style={{
            ...typographyToStyle(commerceTypography.caption1Semi),
            color: commerceColors.text.secondary,
          }}
        >
          Quantity
        </span>
        {onQuantityChange ? (
          <QuantitySelector
            className={cn(
              "w-20 overflow-hidden",
              // Figma cart quantity: 80x32. 기본 QuantitySelector는 버튼 px 때문에
              // 80px 컬럼을 넘을 수 있어 cart row에서는 hit area를 명시적으로 맞춥니다.
              "[&>button]:w-6 [&>button]:px-0 [&>span]:min-w-8",
            )}
            value={quantity}
            min={1}
            onChange={onQuantityChange}
            disabled={disabled}
            variant="cart"
          />
        ) : (
          <span
            className="tabular-nums"
            style={{
              ...typographyToStyle(commerceTypography.caption2Semi),
              color: commerceColors.primary.dark,
            }}
          >
            {quantity}
          </span>
        )}
      </div>

      <div className="flex items-center justify-between text-right sm:flex sm:justify-center">
        <span
          className="sm:hidden"
          style={{
            ...typographyToStyle(commerceTypography.caption1Semi),
            color: commerceColors.text.secondary,
          }}
        >
          Price
        </span>
        <span
          className="w-full tabular-nums text-center"
          style={{
            ...typographyToStyle(commerceTypography.body2),
            color: commerceColors.primary.dark,
          }}
        >
          {formatMoney(unitPrice, currency)}
        </span>
      </div>

      <div className="flex items-center justify-between text-right sm:flex sm:justify-center">
        <span
          className="sm:hidden"
          style={{
            ...typographyToStyle(commerceTypography.caption1Semi),
            color: commerceColors.text.secondary,
          }}
        >
          Subtotal
        </span>
        <span
          className="w-full tabular-nums text-center"
          style={{
            ...typographyToStyle(commerceTypography.body2Semi),
            color: commerceColors.primary.dark,
          }}
        >
          {formatMoney(total, currency)}
        </span>
      </div>
    </div>
  );
}
