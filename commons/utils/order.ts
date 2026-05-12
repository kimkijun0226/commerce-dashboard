/** 결제 진행 중인 내부 주문 UUID (Supabase `orders.id`) */
export const CHECKOUT_PENDING_ORDER_ID_KEY = "commerce_pending_order_id";

export function setSessionPendingOrderId(orderId: string) {
  if (typeof sessionStorage === "undefined") return;
  sessionStorage.setItem(CHECKOUT_PENDING_ORDER_ID_KEY, orderId);
}

export function clearSessionPendingOrderId() {
  if (typeof sessionStorage === "undefined") return;
  sessionStorage.removeItem(CHECKOUT_PENDING_ORDER_ID_KEY);
}

export function getSessionPendingOrderId(): string | null {
  if (typeof sessionStorage === "undefined") return null;
  const v = sessionStorage.getItem(CHECKOUT_PENDING_ORDER_ID_KEY);
  return v && v.trim() ? v.trim() : null;
}

/** Toss 결제창용 회원 customerKey (문서: 고객 고유 식별자) */
export function tossCustomerKeyForUser(userId: string) {
  return `uid_${userId.replace(/-/g, "")}`;
}

export function buildCheckoutOrderName(args: { firstItemName: string; itemCount: number }) {
  const { firstItemName, itemCount } = args;
  if (itemCount <= 1) return firstItemName;
  return `${firstItemName} 외 ${itemCount - 1}건`;
}
