"use client";

import Image from "next/image";
import { commerceColors } from "@/commons/constants/color";
import { commerceTypography } from "@/commons/constants/typography";
import { cn, typographyToStyle } from "@/components/ui";
import type { PricingTotals } from "@/lib/commerce/pricing";
import { QuantitySelector } from "@/components/commerce/QuantitySelector/QuantitySelector";

export type OrderSummaryItem = {
  productId: string;
  name: string;
  imageUrl: string | null;
  quantity: number;
  unitPrice: number;
  unitSalePrice: number | null;
};

export type OrderSummaryProps = {
  items: readonly OrderSummaryItem[];
  totals: PricingTotals;
  currency?: string;
  className?: string;
  editable?: boolean;
  onQuantityChange?: (productId: string, nextQty: number) => void;
  quantityUpdating?: boolean;
};

function formatMoney(n: number, currency = "₩") {
  return `${currency}${Math.round(n).toLocaleString("ko-KR")}`;
}

function getUnitPrice(it: Pick<OrderSummaryItem, "unitPrice" | "unitSalePrice">) {
  return it.unitSalePrice ?? it.unitPrice;
}

export function OrderSummary({
  items,
  totals,
  currency = "₩",
  className,
  editable = false,
  onQuantityChange,
  quantityUpdating = false,
}: OrderSummaryProps) {
  return (
    <aside
      className={cn("rounded-2xl border p-6 lg:sticky lg:top-24", className)}
      style={{
        backgroundColor: commerceColors.background.paper,
        borderColor: commerceColors.border.strong,
      }}
      aria-label="주문 요약"
    >
      <h2
        className="mb-4"
        style={{
          ...typographyToStyle(commerceTypography.headline7),
          color: commerceColors.text.primary,
        }}
      >
        Order Summary
      </h2>

      <div className="flex flex-col gap-4">
        {items.map((it) => {
          const unit = getUnitPrice(it);
          const line = unit * it.quantity;
          return (
            <div key={it.productId} className="flex items-center gap-4">
              <div className="relative size-16 shrink-0 overflow-hidden rounded-md bg-(--commerce-background-light)">
                {it.imageUrl ? (
                  <Image
                    src={it.imageUrl}
                    alt={it.name}
                    fill
                    sizes="64px"
                    className="object-cover"
                    unoptimized={
                      it.imageUrl.startsWith("http://") || it.imageUrl.startsWith("https://")
                    }
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
                  {it.name}
                </p>
                {editable && onQuantityChange ? (
                  <div className="mt-2 flex items-center justify-between gap-3">
                    <span
                      style={{
                        ...typographyToStyle(commerceTypography.caption2),
                        color: commerceColors.text.secondary,
                      }}
                    >
                      Qty
                    </span>
                    <QuantitySelector
                      variant="cart"
                      value={it.quantity}
                      disabled={quantityUpdating}
                      onChange={(next) => onQuantityChange(it.productId, next)}
                    />
                  </div>
                ) : (
                  <p
                    className="mt-1"
                    style={{
                      ...typographyToStyle(commerceTypography.caption2),
                      color: commerceColors.text.secondary,
                    }}
                  >
                    Qty {it.quantity}
                  </p>
                )}
              </div>

              <div
                className="shrink-0 tabular-nums"
                style={{
                  ...typographyToStyle(commerceTypography.body2Semi),
                  color: commerceColors.text.primary,
                }}
              >
                {formatMoney(line, currency)}
              </div>
            </div>
          );
        })}
      </div>

      <div className="my-6 h-px w-full bg-(--commerce-border-subtle)" aria-hidden />

      <div className="flex flex-col gap-3">
        <Row label="Subtotal" value={formatMoney(totals.subtotal, currency)} />
        <Row
          label="Shipping"
          value={totals.shipping === 0 ? "Free" : formatMoney(totals.shipping, currency)}
        />
        <Row
          label="Discount"
          value={totals.discount > 0 ? `- ${formatMoney(totals.discount, currency)}` : formatMoney(0, currency)}
          muted
        />
        <div className="h-px w-full bg-(--commerce-border-subtle)" aria-hidden />
        <Row
          label="Total"
          value={formatMoney(totals.total, currency)}
          strong
        />
      </div>
    </aside>
  );
}

function Row({
  label,
  value,
  muted,
  strong,
}: {
  label: string;
  value: string;
  muted?: boolean;
  strong?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span
        style={{
          ...(strong
            ? typographyToStyle(commerceTypography.body2Semi)
            : typographyToStyle(commerceTypography.body2)),
          color: muted ? commerceColors.text.muted : commerceColors.text.secondary,
        }}
      >
        {label}
      </span>
      <span
        className="tabular-nums"
        style={{
          ...(strong
            ? typographyToStyle(commerceTypography.body2Semi)
            : typographyToStyle(commerceTypography.body2)),
          color: commerceColors.text.primary,
        }}
      >
        {value}
      </span>
    </div>
  );
}

