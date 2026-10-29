import {
  FiPackage,
  FiShoppingCart,
  FiDollarSign,
  FiTruck,
} from "react-icons/fi";
import Link from "next/link";
import { DailySalesChart } from "@/components/admin/SalesCharts";
import { checkAdminAccess } from "@/lib/auth/admin";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { AdminMetricCard } from "@/components/admin";
import { STOREFRONTS, parseStoreKey } from "@/lib/catalog/storefront";
export default async function AdminPage() {
  if (!(await checkAdminAccess())) notFound();
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_admin_combined_dashboard");
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
        <p className="admin-page-eyebrow">OVERVIEW</p>
        <h1 className="admin-page-heading mt-2">주문·결제 매출 대시보드</h1>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <AdminMetricCard
          title="전체 상품"
          icon={<FiPackage />}
          value={`${stats.products.toLocaleString()}개`}
          trend={{ direction: "flat", label: `판매중 ${stats.visible}개` }}
        />
        <AdminMetricCard
          title="전체 주문"
          icon={<FiShoppingCart />}
          value={`${stats.orders.toLocaleString()}건`}
        />
        <AdminMetricCard
          title="누적 결제 매출"
          icon={<FiDollarSign />}
          value={`${stats.revenue.toLocaleString()}원`}
          trend={{ direction: "flat", label: "취소·환불 주문 제외" }}
        />
        <Link
          href="/admin/orders?fulfillment=preparing&payment=paid"
          className="block"
        >
          <AdminMetricCard
            title="배송 준비 필요"
            icon={<FiTruck />}
            value={`${stats.pendingShipment.toLocaleString()}건`}
          />
        </Link>
      </div>
      <div className="grid gap-5 lg:grid-cols-[2fr_1fr]">
        <section className="admin-panel">
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
        <section className="admin-panel">
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
