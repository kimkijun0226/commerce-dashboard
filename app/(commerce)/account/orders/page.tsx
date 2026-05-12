import { getPendingReviewSlotCountForUser } from "@/app/(commerce)/account/reviews/pending-queries";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ACCOUNT_URLS, COMMERCE_URLS } from "@/commons/constants/url";
import { AccountSidebar } from "@/components/account/AccountSidebar/AccountSidebar";
import type { UserRole } from "@/types/supabase";
import { OrdersTable, type OrdersTableRow } from "@/components/account/OrdersTable";

const PAGE_SIZE = 10;

export default async function AccountOrdersPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>> | Record<string, string | string[] | undefined>;
}) {
  const sp = await Promise.resolve(searchParams ?? {});
  const raw = sp.page;
  const page = Math.max(1, Number(Array.isArray(raw) ? raw[0] : raw ?? "1") || 1);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email) redirect(`/login?next=${encodeURIComponent(ACCOUNT_URLS.ORDERS)}`);

  const { data: profile } = await supabase
    .from("users")
    .select("display_name,email,role,image_url")
    .eq("id", user.id)
    .maybeSingle();

  const displayName = profile?.display_name ?? null;
  const email = profile?.email ?? user.email ?? "";
  const role = (profile?.role ?? "user") as UserRole;
  const imageUrl = profile?.image_url ?? null;

  const pendingReviewCount = await getPendingReviewSlotCountForUser();

  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const { data: orders, count } = await supabase
    .from("orders")
    .select("id,status,payment_status,total_amount,currency,created_at", { count: "exact" })
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .range(from, to);

  const total = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  if (page > totalPages) {
    redirect(`${ACCOUNT_URLS.ORDERS}?page=${totalPages}`);
  }

  const baseRows: OrdersTableRow[] = ((orders ?? []) as any[]).map((o) => ({
    id: String(o.id),
    createdAt: String(o.created_at),
    status: o.status,
    paymentStatus: o.payment_status,
    totalAmount: Number(o.total_amount),
    currency: String(o.currency ?? "KRW"),
  }));

  // 주문 요약(대표 상품명 + 총 수량)을 위해 order_items를 추가 조회
  const orderIds = baseRows.map((r) => r.id);
  let rows = baseRows;
  if (orderIds.length > 0) {
    const { data: items } = await supabase
      .from("order_items")
      .select("order_id, product_name, quantity")
      .in("order_id", orderIds);
    const byOrder = new Map<string, { primary: string | null; totalQty: number; distinct: number; seen: Set<string> }>();
    for (const it of (items ?? []) as any[]) {
      const oid = String(it.order_id);
      const prev = byOrder.get(oid) ?? { primary: null, totalQty: 0, distinct: 0, seen: new Set<string>() };
      const q = Math.max(1, Number(it.quantity) || 1);
      const name = it.product_name ? String(it.product_name) : null;
      if (!prev.primary && name) prev.primary = name;
      prev.totalQty += q;
      // product_name 기준으로 distinct 계산 (PK가 없어서 근사치)
      const key = name ?? `unknown_${prev.seen.size}`;
      if (!prev.seen.has(key)) {
        prev.seen.add(key);
        prev.distinct += 1;
      }
      byOrder.set(oid, prev);
    }
    rows = baseRows.map((r) => {
      const info = byOrder.get(r.id);
      return info
        ? { ...r, primaryItemName: info.primary, totalQuantity: info.totalQty, distinctItemCount: info.distinct }
        : r;
    });
  }

  return (
    <div className="bg-(--commerce-background-default) pb-16 pt-6 sm:pt-10">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-[160px]">
        <div className="flex items-end justify-between gap-6">
          <h1
            className="text-[40px] font-medium leading-[48px] tracking-[-1px] text-black sm:text-[54px] sm:leading-[58px]"
            style={{ fontFamily: "var(--commerce-font-heading)" }}
          >
            My Orders
          </h1>
          <Link
            href={COMMERCE_URLS.PRODUCTS}
            className="text-[14px] font-semibold leading-[22px] text-(--commerce-text-secondary) hover:text-(--commerce-text-primary)"
          >
            쇼핑 계속하기 →
          </Link>
        </div>

        <div className="mt-10 flex flex-col gap-6 lg:mt-16 lg:flex-row lg:gap-2">
          <AccountSidebar
            displayName={displayName}
            email={email}
            role={role}
            imageUrl={imageUrl}
            pendingReviewCount={pendingReviewCount}
          />

          <main className="min-w-0 flex-1 lg:pl-4">
            {pendingReviewCount > 0 ? (
              <Link
                href={ACCOUNT_URLS.REVIEWS_PENDING_INVITES}
                className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-(--commerce-border-subtle) bg-white px-4 py-3 text-sm shadow-sm transition-colors hover:border-(--commerce-primary-main) hover:bg-[rgba(55,125,255,0.04)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--commerce-semantic-info)"
                style={{ fontFamily: "var(--commerce-font-body)" }}
              >
                <span className="text-(--commerce-text-primary)">
                  작성하지 않은 상품평이{" "}
                  <strong className="tabular-nums text-(--commerce-primary-main)">
                    {pendingReviewCount}건
                  </strong>{" "}
                  있어요.
                </span>
                <span className="text-[13px] font-semibold text-(--commerce-text-secondary)">
                  작성하러 가기 →
                </span>
              </Link>
            ) : null}
            <OrdersTable rows={rows} page={page} totalPages={totalPages} />
          </main>
        </div>
      </div>
    </div>
  );
}

