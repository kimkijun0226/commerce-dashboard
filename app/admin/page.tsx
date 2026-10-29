import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { checkAdminAccess } from "@/lib/auth/admin";
import { createClient } from "@/lib/supabase/server";
import {
  AdminMetricCard,
  AdminFilterBar,
  AdminSelect,
  AdminTable,
  AdminStatusBadge,
} from "@/components/admin";
import {
  DailySalesChart,
  SalesBreakdownChart,
} from "@/components/admin/SalesCharts";
import {
  salesFilters,
  salesLabels,
  type SalesData,
  type SalesGroup,
} from "@/lib/admin/sales";
import {
  FiDollarSign,
  FiShoppingCart,
  FiPackage,
  FiTrendingUp,
  FiTag,
  FiRotateCcw,
  FiXCircle,
  FiTruck,
} from "react-icons/fi";
const metricIcons = [
  FiDollarSign,
  FiShoppingCart,
  FiPackage,
  FiTrendingUp,
  FiTag,
  FiRotateCcw,
  FiXCircle,
  FiTruck,
];
const number = (n: number) => n.toLocaleString("ko-KR");
const won = (n: number) => `${number(n)}원`;
function Breakdown({
  title,
  rows,
  kind = "bar",
}: {
  title: string;
  rows: SalesGroup[];
  kind?: "bar" | "doughnut" | "hours";
}) {
  return (
    <section className="admin-panel">
      <h2 className="font-semibold">{title}</h2>
      <SalesBreakdownChart
        title={title}
        rows={rows.map((r) => ({
          ...r,
          label: salesLabels[r.label] ?? r.label,
        }))}
        kind={kind}
      />
    </section>
  );
}
export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  if (!(await checkAdminAccess())) notFound();
  const filters = salesFilters(await searchParams);
  const { days, department, view, page, status, date } = filters;
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_admin_sales", {
    p_days: days,
    p_department: department,
    p_page: page,
    p_status: status,
    ...(date ? { p_date: date } : {}),
  });
  if (error) throw new Error(`판매 분석 조회 실패: ${error.message}`);
  const stats = data as unknown as SalesData;
  const url = (changes: Record<string, string | number>) =>
    `/admin?${new URLSearchParams({ ...Object.fromEntries(Object.entries(filters).map(([k, v]) => [k, String(v)])), ...Object.fromEntries(Object.entries(changes).map(([k, v]) => [k, String(v)])) })}`;
  if (page > 1 && (page - 1) * 25 >= stats.total) redirect(url({ page: 1 }));
  const s = stats.summary;
  const change = stats.previousRevenue
    ? `${((s.revenue / stats.previousRevenue - 1) * 100).toFixed(1)}%`
    : "비교 매출 없음";
  const cards = [
    ["순매출", won(s.revenue), `직전 ${days}일 대비 ${change}`],
    ["주문 수", `${number(s.orders)}건`, `결제 완료 ${number(s.paid)}건`],
    ["판매 수량", `${number(s.units)}개`, "결제 완료 상품 수량"],
    [
      "객단가",
      won(s.paid ? Math.round(s.revenue / s.paid) : 0),
      "순매출 ÷ 결제 완료 주문",
    ],
    ["할인 적용액", won(s.discount), "결제 완료 주문 기준"],
    ["환불액", won(s.refund), "전액 환불 주문 합계"],
    [
      "취소율",
      `${(s.orders ? (s.canceled / s.orders) * 100 : 0).toFixed(1)}%`,
      `취소 ${number(s.canceled)}건`,
    ],
    ["배송 준비", `${number(s.pendingShipment)}건`, "결제 완료 · 출고 대기"],
  ];
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="admin-page-eyebrow">SALES INTELLIGENCE</p>
          <h1 className="admin-page-heading mt-2">판매 분석 대시보드</h1>
          <p className="mt-2 text-sm text-gray-500">
            매출의 흐름부터 상품별 성과와 주문 한 건까지.
          </p>
        </div>
        <Link href="/admin/live" className="admin-button-secondary">
          주문·결제 대시보드 →
        </Link>
      </div>
      <form key={`${days}:${department}:${view}`}>
        <input type="hidden" name="view" value={view} />
        <AdminFilterBar
          className="admin-filter"
          leftSlot={
            <>
              <label className="space-y-2">
                <span className="block">조회 기간</span>
                <AdminSelect
                  name="days"
                  aria-label="조회 기간"
                  defaultValue={String(days)}
                  options={[7, 30, 90].map((n) => ({
                    value: String(n),
                    label: `최근 ${n}일`,
                  }))}
                  className="min-w-36"
                />
              </label>
              <label className="space-y-2">
                <span className="block">매장</span>
                <AdminSelect
                  name="department"
                  aria-label="매장"
                  defaultValue={department}
                  options={[
                    { value: "", label: "전체 매장" },
                    ...["fashion", "beauty", "home"].map((k) => ({
                      value: k,
                      label: salesLabels[k],
                    })),
                  ]}
                  className="min-w-36"
                />
              </label>
              <button className="admin-button">조회</button>
            </>
          }
          rightSlot={
            <p className="pb-2 text-xs text-(--admin-text-muted)">
              {stats.start} ~ {stats.end}
            </p>
          }
        />
      </form>
      <nav aria-label="판매 분석 메뉴" className="admin-tabs">
        {[
          ["overview", "매출 요약"],
          ["products", "상품별 판매"],
          ["operations", "배송 · 유입 분석"],
          ["orders", "판매 내역"],
        ].map(([key, label]) => (
          <Link
            key={key}
            href={url({ view: key, page: 1, status: "", date: "" })}
            aria-current={view === key ? "page" : undefined}
            className="whitespace-nowrap"
          >
            {label}
          </Link>
        ))}
      </nav>
      {view === "overview" && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {cards.map(([title, value, label], index) => {
              const Icon = metricIcons[index];
              const card = (
                <AdminMetricCard
                  title={title}
                  icon={<Icon />}
                  value={value}
                  trend={{ direction: "flat", label }}
                />
              );
              return title === "배송 준비" ? (
                <Link
                  key={title}
                  className="block"
                  href="/admin/orders?fulfillment=preparing&payment=paid"
                >
                  {card}
                </Link>
              ) : (
                <div key={title}>{card}</div>
              );
            })}
          </div>
          <section className="admin-panel">
            <div className="flex justify-between">
              <h2 className="font-semibold">일별 매출 추이</h2>
              <Link
                href={url({ view: "orders", page: 1 })}
                className="text-xs text-gray-500"
              >
                판매 내역 보기 →
              </Link>
            </div>
            <p className="mt-1 text-xs text-gray-400">
              차트의 점을 누르면 해당 날짜의 판매 내역을 확인할 수 있습니다.
            </p>
            <DailySalesChart
              rows={stats.daily.map((d) => ({
                ...d,
                href: url({ view: "orders", page: 1, date: d.day, status: "" }),
              }))}
            />
          </section>
          <div className="grid gap-4 lg:grid-cols-2">
            <Breakdown
              kind="doughnut"
              title="매장별 주문 수 · 순매출"
              rows={stats.departments}
            />
            <Breakdown
              kind="doughnut"
              title="주문 상태"
              rows={stats.statuses}
            />
          </div>
        </>
      )}
      {view === "products" && (
        <section className="admin-panel">
          <h2 className="font-semibold">상품 매출 순위 · TOP 50</h2>
          <p className="mt-1 text-xs text-gray-400">
            상품명을 누르면 상품 관리에서 상세 정보를 확인할 수 있습니다. 주문
            수는 취소·환불 포함, 판매 수량과 매출은 결제 완료 기준입니다.
          </p>
          <div className="mt-6">
            <AdminTable
              columns={[
                { key: "rank", header: "순위" },
                { key: "name", header: "상품" },
                { key: "department", header: "매장" },
                { key: "orders", header: "주문", align: "right" },
                { key: "units", header: "판매 수량", align: "right" },
                { key: "revenue", header: "순매출", align: "right" },
              ]}
              rows={stats.products.map((p, i) => ({
                key: `${p.product_id}:${p.product_name}`,
                rank: (
                  <span className="text-(--admin-text-muted)">{i + 1}</span>
                ),
                name: p.product_id ? (
                  <Link
                    className="block min-w-40 max-w-72 font-medium hover:underline"
                    href={`/admin/products/${p.product_id}`}
                  >
                    {p.product_name}
                  </Link>
                ) : (
                  p.product_name
                ),
                department: salesLabels[p.department],
                orders: `${number(p.orders)}건`,
                units: `${number(p.units ?? 0)}개`,
                revenue: (
                  <span className="whitespace-nowrap font-semibold">
                    {won(p.revenue)}
                  </span>
                ),
              }))}
              getRowKey={(row) => String(row.key)}
            />
          </div>
          {!stats.products.length && (
            <p className="py-8 text-center text-sm text-gray-400">
              판매 내역이 없습니다.
            </p>
          )}
        </section>
      )}
      {view === "operations" && (
        <>
          <div className="grid gap-3 sm:grid-cols-2">
            <AdminMetricCard
              title="재구매 고객 주문 비중"
              value={`${(s.orders ? (s.returning / s.orders) * 100 : 0).toFixed(1)}%`}
              trend={{
                direction: "flat",
                label: `재구매 ${number(s.returning)}건 · 신규 ${number(s.orders - s.returning)}건`,
              }}
            />
            <AdminMetricCard
              title="출고 대기 주문"
              value={`${number(s.pendingShipment)}건`}
              trend={{
                direction: "flat",
                label: "결제 완료 · 출고 대기",
              }}
            />
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            <Breakdown title="유입 경로" rows={stats.channels} />
            <Breakdown
              title="배송 현황 · 결제 완료 주문"
              rows={stats.fulfillments}
            />
            <Breakdown title="지역별 주문" rows={stats.regions} />
            <Breakdown title="결제 수단" rows={stats.payments} />
            <Breakdown
              kind="hours"
              title="시간대별 주문 · 한국 시간"
              rows={stats.hours}
            />
          </div>
        </>
      )}
      {view === "orders" && (
        <section className="admin-panel">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-semibold">
              판매 내역{" "}
              <span className="text-gray-400">{number(stats.total)}건</span>
            </h2>
            <div className="flex flex-wrap gap-2">
              {["", "paid", "canceled", "refunded", "pending"].map((k) => (
                <Link
                  key={k}
                  href={url({ status: k, page: 1 })}
                  className="admin-status-filter"
                  aria-current={status === k ? "page" : undefined}
                >
                  {salesLabels[k] ?? "전체"}
                </Link>
              ))}
            </div>
          </div>
          <form className="mt-4 flex flex-wrap items-end gap-2">
            <input type="hidden" name="view" value="orders" />
            <input type="hidden" name="days" value={days} />
            <input type="hidden" name="department" value={department} />
            <input type="hidden" name="status" value={status} />
            <label className="text-xs text-gray-500">
              판매 날짜
              <input
                aria-label="판매 날짜"
                name="date"
                type="date"
                min={stats.start}
                max={stats.end}
                defaultValue={date}
                className="admin-field ml-2"
              />
            </label>
            <button className="admin-button-secondary">날짜 조회</button>
            {date && (
              <Link
                className="p-2 text-xs underline"
                href={url({ date: "", page: 1 })}
              >
                날짜 초기화
              </Link>
            )}
          </form>
          <div className="mt-5 space-y-2">
            {stats.rows.map((r) => (
              <details key={r.id} className="admin-sale-row">
                <summary className="cursor-pointer p-4 text-sm">
                  <span className="mr-3 text-xs text-gray-400">
                    {new Date(r.ordered_at).toLocaleString("ko-KR", {
                      timeZone: "Asia/Seoul",
                      month: "2-digit",
                      day: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                  <strong>{r.product_name}</strong>
                  <span className="mt-2 flex justify-between gap-2 text-xs text-gray-500">
                    <span>
                      {r.id} ·{" "}
                      <AdminStatusBadge
                        variant={
                          r.status === "paid"
                            ? "success"
                            : r.status === "pending"
                              ? "warning"
                              : r.status === "canceled"
                                ? "danger"
                                : "neutral"
                        }
                      >
                        {salesLabels[r.status]}
                      </AdminStatusBadge>{" "}
                      · {r.quantity}개
                    </span>
                    <span>{won(r.gross_amount - r.discount_amount)}</span>
                  </span>
                </summary>
                <dl className="grid gap-3 border-t bg-gray-50 p-4 text-xs sm:grid-cols-2">
                  {[
                    ["매장", salesLabels[r.department]],
                    ["판매 상태", salesLabels[r.status]],
                    ["상품 금액", won(r.gross_amount)],
                    ["할인", won(r.discount_amount)],
                    ["순매출 반영액", won(r.net)],
                    [
                      "배송 상태",
                      r.status === "paid"
                        ? salesLabels[r.fulfillment]
                        : "발송 대상 아님",
                    ],
                    ["유입 경로", r.channel],
                    ["지역", r.region],
                    ["결제 수단", r.payment_method],
                    ["고객 유형", r.returning_customer ? "재구매" : "신규"],
                  ].map(([k, v]) => (
                    <div key={k} className="flex justify-between gap-3">
                      <dt className="text-gray-500">{k}</dt>
                      <dd>{v}</dd>
                    </div>
                  ))}
                </dl>
              </details>
            ))}
            {!stats.rows.length && (
              <p className="py-8 text-center text-sm text-gray-400">
                해당 조건의 판매 내역이 없습니다.
              </p>
            )}
          </div>
          <div className="mt-5 flex items-center justify-between text-sm">
            {page > 1 ? (
              <Link href={url({ page: page - 1 })}>← 이전</Link>
            ) : (
              <span />
            )}
            <span>
              {page} / {Math.max(1, Math.ceil(stats.total / 25))}
            </span>
            {page * 25 < stats.total ? (
              <Link href={url({ page: page + 1 })}>다음 →</Link>
            ) : (
              <span />
            )}
          </div>
        </section>
      )}
      <p className="text-xs text-gray-400">
        조회 시각{" "}
        {new Date(stats.updatedAt).toLocaleString("ko-KR", {
          timeZone: "Asia/Seoul",
        })}{" "}
        · 매출 기준: 상품 금액 − 할인 · 배송비 제외 · 원화
      </p>
    </div>
  );
}
