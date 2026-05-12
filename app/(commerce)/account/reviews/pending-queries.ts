import { createClient } from "@/lib/supabase/server";

export type PendingReviewSlotModel = {
  orderId: string;
  productId: string;
  orderCreatedAt: string;
  productName: string | null;
  productImageUrl: string | null;
};

/**
 * 결제 완료 주문·상품 조합 중 아직 리뷰가 없는 항목 (최신 주문 우선, 최대 50건).
 */
export async function getPendingReviewSlotsForUser(): Promise<PendingReviewSlotModel[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email) return [];

  const { data: lines, error } = await supabase
    .from("order_items")
    .select(
      `
      order_id,
      product_id,
      product_name,
      product_image_url,
      orders!inner (
        id,
        user_id,
        status,
        payment_status,
        created_at
      )
    `,
    )
    .eq("orders.user_id", user.id)
    .eq("orders.status", "paid")
    .eq("orders.payment_status", "success");

  if (error || !lines?.length) return [];

  type Line = {
    order_id: string;
    product_id: string;
    product_name: string | null;
    product_image_url: string | null;
    orders: { created_at: string } | { created_at: string }[] | null;
  };

  const slots = new Map<string, PendingReviewSlotModel>();
  for (const raw of lines as Line[]) {
    const od = raw.orders;
    const order = Array.isArray(od) ? od[0] : od;
    if (!order?.created_at) continue;
    const key = `${raw.order_id}:${raw.product_id}`;
    if (slots.has(key)) continue;
    slots.set(key, {
      orderId: raw.order_id,
      productId: raw.product_id,
      orderCreatedAt: order.created_at,
      productName: raw.product_name,
      productImageUrl: raw.product_image_url,
    });
  }

  const orderIds = [...new Set([...slots.values()].map((s) => s.orderId))];
  const reviewed = new Set<string>();

  if (orderIds.length > 0) {
    const { data: existing } = await supabase
      .from("reviews")
      .select("order_id, product_id")
      .eq("user_id", user.id)
      .in("order_id", orderIds);

    for (const r of existing ?? []) {
      reviewed.add(`${r.order_id}:${r.product_id}`);
    }
  }

  return [...slots.values()]
    .filter((s) => !reviewed.has(`${s.orderId}:${s.productId}`))
    .sort((a, b) => b.orderCreatedAt.localeCompare(a.orderCreatedAt))
    .slice(0, 50);
}

/** 사이드바 배지 등 — `getPendingReviewSlotsForUser`와 동일 기준의 건수만 필요할 때 */
export async function getPendingReviewSlotCountForUser(): Promise<number> {
  const slots = await getPendingReviewSlotsForUser();
  return slots.length;
}
