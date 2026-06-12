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

/**
 * 해당 상품이 포함된 결제 완료 주문 중, 아직 `(order_id, product_id)` 리뷰가 없는 가장 이른 `order_id`.
 * 관리자가 구매 없이 테스트 리뷰를 달 때 `order_id` FK를 맞추기 위해 사용합니다.
 */
export async function findFirstUnreviewedPaidOrderIdForProduct(
  supabase: SupabaseClient<Database>,
  productId: string,
): Promise<string | null> {
  const { data: lines, error } = await supabase
    .from("order_items")
    .select("order_id, orders!inner(id, created_at, status, payment_status)")
    .eq("product_id", productId)
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
    if (!orderCreated.has(line.order_id)) {
      orderCreated.set(line.order_id, order.created_at);
    }
  }

  const sortedIds = [...orderCreated.entries()]
    .sort((a, b) => new Date(a[1]).getTime() - new Date(b[1]).getTime())
    .map(([id]) => id);

  if (sortedIds.length === 0) return null;

  const { data: existing, error: revErr } = await supabase
    .from("reviews")
    .select("order_id")
    .eq("product_id", productId)
    .in("order_id", sortedIds);

  if (revErr) throw new Error(revErr.message);

  const reviewed = new Set((existing ?? []).map((r) => r.order_id));
  for (const oid of sortedIds) {
    if (!reviewed.has(oid)) return oid;
  }
  return null;
}
