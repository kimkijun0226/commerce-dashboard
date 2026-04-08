"use client";

import { commerceColors } from "@/commons/constants/color";
import { commerceTypography } from "@/commons/constants/typography";
import type { OrderSummaryLine } from "@/components/commerce/types";
import { cn, typographyToStyle } from "@/components/ui";

export type OrderSummaryPanelProps = {
  lines: readonly OrderSummaryLine[];
  totalLabel?: string;
  totalAmount?: number;
  currency?: string;
  className?: string;
};

function formatMoney(n: number, currency = "₩") {
  return `${currency}${n.toLocaleString("ko-KR")}`;
}

export function OrderSummaryPanel({
  lines,
  totalLabel = "결제 예정 금액",
  totalAmount,
  currency = "₩",
  className,
}: OrderSummaryPanelProps) {
  const computedTotal =
    totalAmount ?? lines.reduce((sum, l) => sum + l.amount, 0);

  return (
    <aside
      className={cn("rounded-2xl border p-4", className)}
      style={{
        backgroundColor: commerceColors.background.paper,
        borderColor: commerceColors.border.subtle,
      }}
      aria-label="주문 요약"
    >
      <div className="flex flex-col gap-2">
        {lines.map((l) => (
          <div key={l.id} className="flex items-center justify-between gap-4">
            <span
              style={{
                ...typographyToStyle(commerceTypography.body2),
                color: l.muted
                  ? commerceColors.text.muted
                  : commerceColors.text.secondary,
              }}
            >
              {l.label}
            </span>
            <span
              className="tabular-nums"
              style={{
                ...typographyToStyle(commerceTypography.body2),
                color: commerceColors.text.primary,
              }}
            >
              {formatMoney(l.amount, currency)}
            </span>
          </div>
        ))}
      </div>

      <div
        className="my-3 h-px w-full"
        style={{ backgroundColor: commerceColors.border.subtle }}
        aria-hidden
      />

      <div className="flex items-center justify-between gap-4">
        <span
          style={{
            ...typographyToStyle(commerceTypography.body2Semi),
            color: commerceColors.text.primary,
          }}
        >
          {totalLabel}
        </span>
        <span
          className="tabular-nums"
          style={{
            ...typographyToStyle(commerceTypography.body2Semi),
            color: commerceColors.text.primary,
          }}
        >
          {formatMoney(computedTotal, currency)}
        </span>
      </div>
    </aside>
  );
}

