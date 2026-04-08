"use client";

import { commerceColors } from "@/commons/constants/color";
import { commerceTypography } from "@/commons/constants/typography";
import { Button, cn, typographyToStyle } from "@/components/ui";

export type CartSummaryProps = {
  subtotal: number;
  shipping?: number;
  discount?: number;
  total?: number;
  currency?: string;
  onCheckout?: () => void;
  disabled?: boolean;
  className?: string;
};

function formatMoney(n: number, currency = "₩") {
  return `${currency}${n.toLocaleString("ko-KR")}`;
}

export function CartSummary({
  subtotal,
  shipping = 0,
  discount = 0,
  total,
  currency = "₩",
  onCheckout,
  disabled,
  className,
}: CartSummaryProps) {
  const computedTotal = total ?? Math.max(0, subtotal + shipping - discount);

  const line = (
    label: string,
    amount: number,
    opts?: { strong?: boolean; muted?: boolean },
  ) => (
    <div className="flex items-center justify-between gap-4">
      <span
        style={{
          ...typographyToStyle(commerceTypography.body2),
          color: opts?.muted
            ? commerceColors.text.muted
            : commerceColors.text.secondary,
        }}
      >
        {label}
      </span>
      <span
        className="tabular-nums"
        style={{
          ...typographyToStyle(
            opts?.strong ? commerceTypography.body2Semi : commerceTypography.body2,
          ),
          color: commerceColors.text.primary,
        }}
      >
        {formatMoney(amount, currency)}
      </span>
    </div>
  );

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
        {line("상품 금액", subtotal)}
        {line("배송비", shipping, { muted: shipping === 0 })}
        {discount > 0 ? line("할인", -discount) : null}
        <div
          className="my-2 h-px w-full"
          style={{ backgroundColor: commerceColors.border.subtle }}
          aria-hidden
        />
        {line("결제 예정 금액", computedTotal, { strong: true })}
      </div>

      {onCheckout ? (
        <Button
          type="button"
          size="lg"
          className="mt-4 w-full"
          onClick={onCheckout}
          disabled={disabled}
        >
          결제하기
        </Button>
      ) : null}
    </aside>
  );
}

