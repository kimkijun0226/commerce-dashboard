import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { checkAdminAccess } from "@/lib/auth/admin";
import { createClient } from "@/lib/supabase/server";
import { FULFILLMENT_LABELS } from "@/lib/admin/validation";
export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  if (!(await checkAdminAccess())) notFound();
  const params = await searchParams;
  const rawPage = Number(params.page);
  const page = Number.isFinite(rawPage)
    ? Math.min(10000, Math.max(1, Math.floor(rawPage)))
    : 1;
  const status =
    typeof params.fulfillment === "string" ? params.fulfillment : "";
  const q = (typeof params.q === "string" ? params.q : "").trim().slice(0, 100);
  const supabase = await createClient();
  const payment = params.payment === "paid" ? "paid" : "";
  const { data: result, error } = await supabase.rpc("get_admin_orders", {
    p_page: page,
    p_q: q,
    p_fulfillment: Object.hasOwn(FULFILLMENT_LABELS, status) ? status : "",
    p_payment: payment,
  });
  if (error) throw new Error(error.message);
  const { rows: data, total: count } = result as unknown as {
    total: number;
    rows: {
      id: string;
      created_at: string;
      shipping_name: string | null;
      total_amount: number;
      status: string;
      payment_status: string;
      fulfillment_status: string;
      shipping_carrier: string | null;
      tracking_number: string | null;
    }[];
  };
  if (page > 1 && !data.length)
    redirect(
      `/admin/orders?${new URLSearchParams({ q, fulfillment: status, payment })}`,
    );
  const pages = Math.max(1, Math.ceil((count ?? 0) / 20));
  const href = (p: number) =>
    `/admin/orders?${new URLSearchParams({ page: String(p), q, fulfillment: status, payment })}`;
  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-semibold">주문 · 배송 관리</h1>
      <p className="text-sm text-gray-500">
        전체 주문 {(count ?? 0).toLocaleString()}건 · 주문을 선택하면 상품,
        배송지, 송장 정보를 확인할 수 있습니다.
      </p>
      <form className="flex flex-wrap gap-2 border border-gray-200 bg-white p-4">
        <input
          name="q"
          defaultValue={q}
          aria-label="주문 검색"
          placeholder="수령인 또는 주문번호"
          className="min-w-0 flex-1 border px-3 py-2 text-sm"
        />
        <select
          name="fulfillment"
          defaultValue={status}
          aria-label="배송 상태 필터"
          className="border px-3 py-2 text-sm"
        >
          <option value="">전체 배송 상태</option>
          {Object.entries(FULFILLMENT_LABELS).map(([key, label]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </select>
        <select
          name="payment"
          defaultValue={payment}
          aria-label="결제 상태 필터"
          className="border px-3 py-2 text-sm"
        >
          <option value="">전체 결제 상태</option>
          <option value="paid">결제 완료만</option>
        </select>
        <button className="bg-black px-4 py-2 text-sm text-white">조회</button>
      </form>
      <div className="overflow-x-auto border border-gray-200 bg-white">
        <table className="w-full min-w-[700px] text-left text-sm">
          <thead className="border-b bg-gray-50 text-xs text-gray-500">
            <tr>
              <th className="p-4">주문번호 / 일시</th>
              <th>수령인</th>
              <th>주문금액</th>
              <th>결제</th>
              <th>배송</th>
              <th>송장</th>
              <th className="pr-4">관리</th>
            </tr>
          </thead>
          <tbody>
            {data?.map((order) => (
              <tr key={order.id} className="border-b border-gray-100">
                <td className="p-4">
                  <Link
                    href={`/admin/orders/${order.id}`}
                    className="font-medium underline"
                  >
                    {order.id.startsWith("SIM-")
                      ? order.id
                      : order.id.slice(0, 8).toUpperCase()}
                  </Link>
                  <p className="mt-1 text-xs text-gray-400">
                    {new Date(order.created_at).toLocaleString("ko-KR", {
                      timeZone: "Asia/Seoul",
                    })}
                  </p>
                </td>
                <td>{order.shipping_name ?? "미입력"}</td>
                <td>{order.total_amount.toLocaleString()}원</td>
                <td className="text-xs">
                  {order.status === "paid" && order.payment_status === "success"
                    ? "결제 완료"
                    : order.status === "refunded"
                      ? "환불"
                      : order.status === "canceled"
                        ? "취소"
                        : "결제 대기"}
                </td>
                <td className="text-xs">
                  {FULFILLMENT_LABELS[order.fulfillment_status] ??
                    order.fulfillment_status}
                </td>
                <td className="text-xs">
                  {order.shipping_carrier}
                  <br />
                  {order.tracking_number ?? "—"}
                </td>
                <td className="pr-4">
                  <Link
                    className="whitespace-nowrap border px-3 py-2 text-xs"
                    href={`/admin/orders/${order.id}`}
                  >
                    배송 관리
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!data?.length ? (
          <div className="p-14 text-center">
            <h2 className="font-medium">표시할 주문이 없습니다</h2>
            <p className="mt-2 text-sm text-gray-500">
              고객의 주문이 접수되면 이곳에서 확인하고 배송을 관리할 수
              있습니다.
            </p>
          </div>
        ) : null}
      </div>
      <nav
        aria-label="주문 목록 페이지"
        className="flex justify-between text-sm"
      >
        {page > 1 ? <Link href={href(page - 1)}>← 이전</Link> : <span />}
        <span>
          {page} / {pages}
        </span>
        {page < pages ? <Link href={href(page + 1)}>다음 →</Link> : <span />}
      </nav>
    </div>
  );
}
