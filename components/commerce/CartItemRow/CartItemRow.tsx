"use client";

import { commerceColors } from "@/commons/constants/color";
import { commerceTypography } from "@/commons/constants/typography";
import { Button, cn, typographyToStyle } from "@/components/ui";
import { QuantitySelector } from "../QuantitySelector/QuantitySelector";
import Image from "next/image";

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
        "flex flex-wrap items-center gap-4 border-b border-[var(--commerce-border-subtle)] py-6 last:border-b-0",
        className,
      )}
    >
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
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="mt-2 h-auto min-h-0 px-0 py-0 text-left underline"
            style={{
              ...typographyToStyle(commerceTypography.caption1Semi),
              color: commerceColors.text.secondary,
            }}
            onClick={onRemove}
            disabled={disabled}
          >
            Remove
          </Button>
        ) : null}
      </div>
      <div className="flex flex-wrap items-center gap-6 sm:ml-auto">
        {onQuantityChange ? (
          <QuantitySelector
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
        <div className="flex flex-col items-end gap-1 text-right sm:min-w-[120px]">
          <span
            className="tabular-nums"
            style={{
              ...typographyToStyle(commerceTypography.body2),
              color: commerceColors.primary.dark,
            }}
          >
            {formatMoney(unitPrice, currency)}
          </span>
          <span
            className="tabular-nums"
            style={{
              ...typographyToStyle(commerceTypography.body2Semi),
              color: commerceColors.primary.dark,
            }}
          >
            {formatMoney(total, currency)}
          </span>
        </div>
      </div>
    </div>
  );
}
