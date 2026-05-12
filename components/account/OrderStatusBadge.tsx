import { commerceColors } from "@/commons/constants/color";
import { commerceTypography } from "@/commons/constants/typography";
import { cn, typographyToStyle } from "@/components/ui";
import type { OrderStatus } from "@/types/supabase";

function labelFor(status: OrderStatus) {
  switch (status) {
    case "pending":
      return "결제대기";
    case "paid":
      return "주문완료";
    case "canceled":
      return "취소";
    case "refunded":
      return "환불";
    default:
      return status;
  }
}

function colorsFor(status: OrderStatus) {
  switch (status) {
    case "paid":
      return { bg: "rgba(56,203,137,0.12)", fg: commerceColors.semantic.success };
    case "pending":
      return { bg: "rgba(255,171,0,0.14)", fg: commerceColors.semantic.warning };
    case "canceled":
      return { bg: "rgba(255,86,48,0.12)", fg: commerceColors.semantic.danger };
    case "refunded":
      return { bg: "rgba(55,125,255,0.12)", fg: commerceColors.semantic.info };
    default:
      return { bg: commerceColors.background.light, fg: commerceColors.text.secondary };
  }
}

export type OrderStatusBadgeProps = {
  status: OrderStatus;
  className?: string;
};

export function OrderStatusBadge({ status, className }: OrderStatusBadgeProps) {
  const label = labelFor(status);
  const { bg, fg } = colorsFor(status);
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
