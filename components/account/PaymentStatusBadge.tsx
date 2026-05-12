import { commerceColors } from "@/commons/constants/color";
import { commerceTypography } from "@/commons/constants/typography";
import { cn, typographyToStyle } from "@/components/ui";
import type { PaymentStatusOrder, PaymentStatusPayment } from "@/types/supabase";

function orderPaymentLabel(status: PaymentStatusOrder) {
  switch (status) {
    case "requested":
      return "요청됨";
    case "success":
      return "성공";
    case "failed":
      return "실패";
    case "refund_requested":
      return "환불 요청";
    case "refund_completed":
      return "환불 완료";
    default:
      return status;
  }
}

function orderPaymentColors(status: PaymentStatusOrder) {
  switch (status) {
    case "success":
      return { bg: "rgba(56,203,137,0.12)", fg: commerceColors.semantic.success };
    case "failed":
      return { bg: "rgba(255,86,48,0.12)", fg: commerceColors.semantic.danger };
    case "requested":
      return { bg: "rgba(255,171,0,0.14)", fg: commerceColors.semantic.warning };
    case "refund_requested":
    case "refund_completed":
      return { bg: "rgba(55,125,255,0.12)", fg: commerceColors.semantic.info };
    default:
      return { bg: commerceColors.background.light, fg: commerceColors.text.secondary };
  }
}

function paymentRowLabel(status: PaymentStatusPayment) {
  switch (status) {
    case "pending":
      return "대기";
    case "succeeded":
      return "승인됨";
    case "failed":
      return "실패";
    case "cancelled":
      return "취소";
    default:
      return status;
  }
}

function paymentRowColors(status: PaymentStatusPayment) {
  switch (status) {
    case "succeeded":
      return { bg: "rgba(56,203,137,0.12)", fg: commerceColors.semantic.success };
    case "failed":
      return { bg: "rgba(255,86,48,0.12)", fg: commerceColors.semantic.danger };
    case "pending":
      return { bg: "rgba(255,171,0,0.14)", fg: commerceColors.semantic.warning };
    case "cancelled":
      return { bg: "rgba(148,163,184,0.18)", fg: commerceColors.text.secondary };
    default:
      return { bg: commerceColors.background.light, fg: commerceColors.text.secondary };
  }
}

export type PaymentStatusBadgeProps = {
  kind: "order" | "payment";
  status: PaymentStatusOrder | PaymentStatusPayment;
  className?: string;
};

export function PaymentStatusBadge({ kind, status, className }: PaymentStatusBadgeProps) {
  const label =
    kind === "order"
      ? orderPaymentLabel(status as PaymentStatusOrder)
      : paymentRowLabel(status as PaymentStatusPayment);
  const { bg, fg } =
    kind === "order"
      ? orderPaymentColors(status as PaymentStatusOrder)
      : paymentRowColors(status as PaymentStatusPayment);

  return (
    <span
      className={cn(
        "inline-flex min-w-[72px] justify-center rounded-full px-3 py-1",
        className,
      )}
      style={{
        backgroundColor: bg,
        color: fg,
        ...typographyToStyle(commerceTypography.caption1Semi),
      }}
    >
      {label}
    </span>
  );
}
