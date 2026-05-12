import Link from "next/link";
import { AccountSidebar } from "@/components/account/AccountSidebar/AccountSidebar";
import { getPendingReviewSlotCountForUser } from "@/app/(commerce)/account/reviews/pending-queries";
import { ACCOUNT_ORDER_URLS, COMMERCE_URLS } from "@/commons/constants/url";
import { createClient } from "@/lib/supabase/server";
import type { UserRole } from "@/types/supabase";
import { notFound, redirect } from "next/navigation";
import { getOrderDetail } from "./queries";
import { OrderDetailView } from "./_components/OrderDetailView";

export default async function AccountOrderDetailPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email) {
    redirect(`/login?next=${encodeURIComponent(ACCOUNT_ORDER_URLS.DETAIL(orderId))}`);
  }

  const detail = await getOrderDetail(supabase, user.id, orderId);
  if (!detail) notFound();

  const reviewableProductIds = new Set<string>();
  if (
    detail.order.status === "paid" &&
    detail.order.paymentStatus === "success" &&
    detail.items.length > 0
  ) {
    const pids = [...new Set(detail.items.map((it) => it.productId))];
    const { data: revRows } = await supabase
      .from("reviews")
      .select("product_id")
      .eq("order_id", orderId)
      .in("product_id", pids);
    const done = new Set((revRows ?? []).map((r) => r.product_id));
    for (const pid of pids) {
      if (!done.has(pid)) reviewableProductIds.add(pid);
    }
  }

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

  return (
    <div className="bg-(--commerce-background-default) pb-16 pt-6 sm:pt-10">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-[160px]">
        <div className="flex items-end justify-between gap-6">
          <h1
            className="text-[40px] font-medium leading-[48px] tracking-[-1px] text-black sm:text-[54px] sm:leading-[58px]"
            style={{ fontFamily: "var(--commerce-font-heading)" }}
          >
            Order Detail
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
            <OrderDetailView
              detail={detail}
              reviewableProductIds={reviewableProductIds}
            />
          </main>
        </div>
      </div>
    </div>
  );
}
