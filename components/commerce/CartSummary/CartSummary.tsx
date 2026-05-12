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
  const shippingLabel = shipping === 0 ? "Free shipping" : "Shipping";

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
      className={cn("rounded-md border p-6", className)}
      style={{
        backgroundColor: commerceColors.background.paper,
        borderColor: commerceColors.border.strong,
      }}
      aria-label="주문 요약"
    >
      <div className="mb-4 flex items-baseline justify-between gap-4">
        <h2
          style={{
            ...typographyToStyle(commerceTypography.headline7),
            color: commerceColors.text.primary,
          }}
        >
          Cart summary
        </h2>
        <span
          className="text-right"
          style={{
            ...typographyToStyle(commerceTypography.caption1),
            color: commerceColors.text.secondary,
          }}
        >
          5만원 이상 구매시 무료배송
        </span>
      </div>

      <div className="mb-4 rounded border border-(--commerce-primary-main) bg-(--commerce-background-light) px-4 py-3">
        <label className="flex items-center justify-between gap-3">
          <span className="flex items-center gap-3">
            <span className="flex size-[18px] items-center justify-center rounded-full border border-(--commerce-primary-dark)">
              <span className="size-2.5 rounded-full bg-(--commerce-primary-dark)" />
            </span>
            <span
              style={{
                ...typographyToStyle(commerceTypography.body2),
                color: commerceColors.text.primary,
              }}
            >
              {shippingLabel}
            </span>
          </span>
          <span
            style={{
              ...typographyToStyle(commerceTypography.body2),
              color: commerceColors.text.primary,
            }}
          >
            {formatMoney(shipping, currency)}
          </span>
        </label>
      </div>

      <div className="flex flex-col gap-2">
        {line("상품 금액", subtotal)}
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
          className="mt-6 h-[52px] w-full rounded-lg"
          onClick={onCheckout}
          disabled={disabled}
        >
          Checkout
        </Button>
      ) : null}
    </aside>
  );
}

