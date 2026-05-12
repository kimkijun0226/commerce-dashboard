import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";

/**
 * 해당 상품을 포함한 사용자의 결제 완료 주문 ID (created_at 오름차순).
 * 한 주문에 동일 상품이 여러 줄이어도 order_id는 한 번만 포함됩니다.
 */
export async function getEligibleOrderIdsForProduct(
  supabase: SupabaseClient<Database>,
  userId: string,
  productId: string,
): Promise<string[]> {
  const { data: lines, error } = await supabase
    .from("order_items")
    .select("order_id, orders!inner(id, created_at, user_id, status, payment_status)")
    .eq("product_id", productId)
    .eq("orders.user_id", userId)
    .eq("orders.status", "paid")
    .eq("orders.payment_status", "success");

  if (error) throw new Error(error.message);

  type LineRow = {
    order_id: string;
    orders:
      | { id: string; created_at: string }
      | { id: string; created_at: string }[]
      | null;
  };
  const rows = (lines ?? []) as LineRow[];

  const orderCreated = new Map<string, string>();
  for (const line of rows) {
    const o = line.orders as
      | { id: string; created_at: string }
      | { id: string; created_at: string }[]
      | null;
    const order = Array.isArray(o) ? o[0] : o;
    if (!order?.id) continue;
    orderCreated.set(line.order_id, order.created_at);
  }

  return [...orderCreated.entries()]
    .sort((a, b) => new Date(a[1]).getTime() - new Date(b[1]).getTime())
    .map(([id]) => id);
}
