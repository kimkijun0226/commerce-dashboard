import Link from "next/link";
import { DailySalesChart } from "@/components/admin/SalesCharts";
import { checkAdminAccess } from "@/lib/auth/admin";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { AdminMetricCard } from "@/components/admin";
import { STOREFRONTS, parseStoreKey } from "@/lib/catalog/storefront";
export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  if (!(await checkAdminAccess())) notFound();
  const source =
    (await searchParams).source === "actual" ? "actual" : "simulation";
  const simulated = source === "simulation";
  const supabase = await createClient();
  const { data, error } = await supabase.rpc(
    simulated ? "get_admin_payment_preview" : "get_admin_dashboard",
  );
  if (error) throw new Error(`대시보드 조회 실패: ${error.message}`);
  const stats = data as {
    paymentCount?: number;
    products: number;
    visible: number;
    orders: number;
    revenue: number;
    pendingShipment: number;
    departments: { department: string; count: number }[];
    dailyRevenue: { day: string; amount: number }[];
  };
  return (
    <div className="space-y-7">
      <div>
        <p className="text-xs tracking-widest text-gray-400">OVERVIEW</p>
        <h1 className="mt-2 text-2xl font-semibold">주문·결제 매출 대시보드</h1>
        <p className="mt-2 text-sm text-gray-500">
          {simulated
            ? "DB에 저장된 시뮬레이션 결제 완료 데이터를 집계합니다."
            : "실제 고객 주문과 결제만 집계합니다."}
        </p>
      </div>
      <nav aria-label="결제 데이터 선택" className="flex flex-wrap gap-2">
        <Link
          href="/admin/live?source=simulation"
          aria-current={simulated ? "page" : undefined}
          className={`border px-4 py-2 text-sm ${simulated ? "bg-black text-white" : "bg-white"}`}
        >
          시뮬레이션 결제
        </Link>
        <Link
          href="/admin/live?source=actual"
          aria-current={!simulated ? "page" : undefined}
          className={`border px-4 py-2 text-sm ${!simulated ? "bg-black text-white" : "bg-white"}`}
        >
          실제 결제
        </Link>
      </nav>
      {simulated ? (
        <p className="border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950">
          시뮬레이션 결제 완료 {stats.paymentCount?.toLocaleString()}건 · 실제
          PG 승인·고객 결제·재고에 영향을 주지 않는 별도 데이터입니다.
        </p>
      ) : stats.orders === 0 ? (
        <div className="border bg-white p-4 text-sm leading-6">
          <p>아직 실제 고객 주문이 없어 결제 매출이 0원입니다.</p>
          <Link
            href="/admin/live?source=simulation"
            className="mt-2 inline-block underline"
          >
            채워진 시뮬레이션 결제 매출 보기 →
          </Link>
        </div>
      ) : null}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <AdminMetricCard
          title="전체 상품"
          value={`${stats.products.toLocaleString()}개`}
          trend={{ direction: "flat", label: `판매중 ${stats.visible}개` }}
          className="!rounded-[3px]"
        />
        <AdminMetricCard
          title="전체 주문"
          value={`${stats.orders.toLocaleString()}건`}
          className="!rounded-[3px]"
        />
        <AdminMetricCard
          title="누적 결제 매출"
          value={`${stats.revenue.toLocaleString()}원`}
          trend={{ direction: "flat", label: "취소·환불 주문 제외" }}
          className="!rounded-[3px]"
        />
        <AdminMetricCard
          title="배송 준비 필요"
          value={`${stats.pendingShipment.toLocaleString()}건`}
          className="!rounded-[3px]"
        />
      </div>
      <div className="grid gap-5 lg:grid-cols-[2fr_1fr]">
        <section className="border border-gray-200 bg-white p-5">
          <h2 className="font-semibold">최근 7일 결제 매출</h2>
          <p className="mt-1 text-xs text-gray-400">
            한국 시간 · 결제 완료일 기준
          </p>
          <DailySalesChart
            valueLabel="결제 매출"
            rows={stats.dailyRevenue.map((d) => ({
              day: d.day,
              revenue: d.amount,
            }))}
          />
        </section>
        <section className="border border-gray-200 bg-white p-5">
          <h2 className="font-semibold">매장별 상품</h2>
          <div className="mt-5 space-y-4">
            {Object.values(STOREFRONTS).map((store) => (
              <Link
                key={store.key}
                href={`/admin/products?department=${store.key}`}
                className="flex justify-between border-b pb-3 text-sm"
              >
                <span>레비 · {store.name}</span>
                <strong>
                  {stats.departments?.find(
                    (d) => parseStoreKey(d.department) === store.key,
                  )?.count ?? 0}
                  개 →
                </strong>
              </Link>
            ))}
          </div>
          <Link
            href="/admin/products/new"
            className="mt-5 inline-block bg-black px-4 py-2 text-sm text-white"
          >
            상품 등록
          </Link>
        </section>
      </div>
    </div>
  );
}
