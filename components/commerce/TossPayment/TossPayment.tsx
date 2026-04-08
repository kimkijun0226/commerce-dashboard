"use client";

import { commerceColors } from "@/commons/constants/color";
import { commerceTypography } from "@/commons/constants/typography";
import { Button, cn, typographyToStyle } from "@/components/ui";
import type { ReactNode } from "react";

export type TossPaymentRequest = {
  /** 주문번호 */
  orderId: string;
  /** 주문명 */
  orderName: string;
  /** 결제 금액 */
  amount: number;
  /** 구매자명 */
  customerName?: string;
};

export type TossPaymentProps = {
  request: TossPaymentRequest;
  onRequestPayment: (req: TossPaymentRequest) => Promise<void> | void;
  disabled?: boolean;
  className?: string;
  helperText?: ReactNode;
};

/**
 * TossPayments 연동을 위한 UI 래퍼 컴포넌트.
 * - 실제 결제 SDK 로딩/호출은 상위에서 `onRequestPayment`로 처리
 * - 이 컴포넌트는 디자인/상태/접근성만 담당
 */
export function TossPayment({
  request,
  onRequestPayment,
  disabled,
  className,
  helperText,
}: TossPaymentProps) {
  return (
    <section
      className={cn("rounded-2xl border p-4", className)}
      style={{
        backgroundColor: commerceColors.background.paper,
        borderColor: commerceColors.border.subtle,
      }}
      aria-label="토스페이먼츠 결제"
    >
      <div className="flex flex-col gap-2">
        <div
          style={{
            ...typographyToStyle(commerceTypography.body2Semi),
            color: commerceColors.text.primary,
          }}
        >
          토스페이먼츠
        </div>
        <div
          style={{
            ...typographyToStyle(commerceTypography.caption2),
            color: commerceColors.text.muted,
          }}
        >
          결제 금액: {request.amount.toLocaleString("ko-KR")}원
        </div>
        {helperText ? (
          <div
            style={{
              ...typographyToStyle(commerceTypography.caption2),
              color: commerceColors.text.muted,
            }}
          >
            {helperText}
          </div>
        ) : null}
      </div>

      <Button
        type="button"
        size="lg"
        className="mt-4 w-full"
        disabled={disabled}
        onClick={() => onRequestPayment(request)}
      >
        토스로 결제하기
      </Button>
    </section>
  );
}

