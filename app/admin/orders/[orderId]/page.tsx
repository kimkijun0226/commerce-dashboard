import Link from "next/link";
import { notFound } from "next/navigation";
import { checkAdminAccess } from "@/lib/auth/admin";
import { createClient } from "@/lib/supabase/server";
import { FulfillmentEditor } from "@/components/admin/FulfillmentEditor";
import { getProductDisplayName } from "@/commons/utils/productDisplay";
export default async function OrderPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  if (!(await checkAdminAccess())) notFound();
  const { orderId } = await params;
  if (
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      orderId,
    )
  )
    notFound();
  const supabase = await createClient();
  const [{ data: order, error }, { data: items, error: itemError }] =
    await Promise.all([
      supabase.from("orders").select("*").eq("id", orderId).maybeSingle(),
      supabase
        .from("order_items")
        .select(
          "id,product_name,quantity,unit_price,unit_sale_price,selected_options,line_subtotal",
        )
        .eq("order_id", orderId),
    ]);
  if (error || itemError) throw new Error(error?.message ?? itemError?.message);
  if (!order) notFound();
  return (
    <div className="space-y-5">
      <Link href="/admin/orders" className="text-sm text-gray-500">
        ← 주문 목록
      </Link>
      <h1 className="text-2xl font-semibold">주문 상세</h1>
      <p className="break-all text-xs text-gray-500">{order.id}</p>
      <div className="grid gap-5 xl:grid-cols-[2fr_1fr]">
        <div className="space-y-5">
          <section className="border border-gray-200 bg-white p-5">
            <h2 className="font-semibold">주문 상품</h2>
            {items?.map((item) => (
              <div
                key={item.id}
                className="flex justify-between gap-4 border-b py-4 text-sm"
              >
                <div>
                  <p>
                    {getProductDisplayName(
                      item.product_name ?? "상품 정보 없음",
                    )}
                  </p>
                  <p className="mt-1 text-xs text-gray-500">
                    {item.selected_options &&
                    typeof item.selected_options === "object"
                      ? Object.entries(item.selected_options)
                          .map(([key, value]) => `${key}: ${String(value)}`)
                          .join(" · ")
                      : ""}
                  </p>
                  <p className="mt-1 text-xs text-gray-500">
                    {(item.unit_sale_price ?? item.unit_price).toLocaleString()}
                    원 × {item.quantity}개
                  </p>
                </div>
                <strong className="shrink-0">
                  {item.line_subtotal.toLocaleString()}원
                </strong>
              </div>
            ))}
            <div className="mt-5 flex justify-between font-semibold">
              <span>결제 금액</span>
              <span>{order.total_amount.toLocaleString()}원</span>
            </div>
            <p className="mt-2 text-xs text-gray-500">
              주문: {order.status} · 결제: {order.payment_status}
            </p>
          </section>
          <section className="space-y-2 border border-gray-200 bg-white p-5 text-sm">
            <h2 className="mb-4 font-semibold">배송지</h2>
            <p>{order.shipping_name ?? order.contact_name ?? "미입력"}</p>
            <p>
              {order.shipping_phone ?? order.contact_phone ?? "연락처 미입력"}
            </p>
            <p>
              {[
                order.shipping_zip,
                order.shipping_address_line1,
                order.shipping_address_line2,
                order.shipping_city,
                order.shipping_state,
              ]
                .filter(Boolean)
                .join(" ") || "배송지 미입력"}
            </p>
          </section>
        </div>
        <FulfillmentEditor key={order.updated_at} order={order} />
      </div>
    </div>
  );
}
