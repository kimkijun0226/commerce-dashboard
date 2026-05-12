import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AccountSidebar } from "@/components/account/AccountSidebar/AccountSidebar";
import { getPendingReviewSlotCountForUser } from "@/app/(commerce)/account/reviews/pending-queries";
import { LikeListSection } from "@/components/account/wishlist/LikeListSection";
import type { LikeListItem } from "@/components/account/wishlist/LikeListTable";
import { AccountPagination } from "@/components/account/AccountPagination";
import { ACCOUNT_URLS, AUTH_URLS } from "@/commons/constants/url";

const PAGE_SIZE = 5;

type LikeRow = {
  id: string;
  created_at: string;
  product_id: string;
  products: null | {
    id: string;
    name: string;
    status: "registered" | "hidden" | "sold_out";
    image_url: string | null;
    price: number;
    sale_price: number | null;
  };
};

export default async function AccountWishlistPage({
  searchParams,
}: {
  searchParams?:
    | Record<string, string | string[] | undefined>
    | Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await Promise.resolve(searchParams ?? {});
  const raw = sp.page;
  const page =
    Math.max(
      1,
      Number(Array.isArray(raw) ? raw[0] : raw ?? "1") || 1,
    ) || 1;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect(AUTH_URLS.LOGIN);
  }

  const { data: profileData } = await supabase
    .from("users")
    .select("display_name, email, role, image_url")
    .eq("id", user.id)
    .single();

  const displayName = profileData?.display_name ?? null;
  const email = profileData?.email ?? user.email ?? "";
  const role = (profileData?.role ?? "user") as "user" | "admin";
  const imageUrl = profileData?.image_url ?? null;

  const pendingReviewCount = await getPendingReviewSlotCountForUser();

  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const { data, count } = await supabase
    .from("like_items")
    .select(
      `
      id,
      created_at,
      product_id,
      products:products (
        id,
        name,
        status,
        image_url,
        price,
        sale_price
      )
    `,
      { count: "exact" },
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .range(from, to)
    .returns<LikeRow[]>();

  const items: LikeListItem[] =
    (data
      ?.map((row): LikeListItem | null => {
        if (!row.products) return null;
        return {
          likeId: row.id,
          likedAt: row.created_at,
          product: {
            id: row.products.id,
            name: row.products.name,
            status: row.products.status,
            imageUrl: row.products.image_url,
            price: row.products.price,
            salePrice: row.products.sale_price,
          },
        };
      })
      .filter((v): v is LikeListItem => v !== null) ?? []) as LikeListItem[];

  const total = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  if (page > totalPages) {
    redirect(`${ACCOUNT_URLS.WISHLIST}?page=${totalPages}`);
  }

  return (
    <div className="bg-(--commerce-background-default) pb-16 pt-6 sm:pt-10">
      <div className="mx-auto max-w-[1120px] px-4 pb-12 pt-16">
        <h1
          className="text-[44px] font-medium leading-[58px] tracking-[-1px] text-black md:text-[54px]"
          style={{ fontFamily: "var(--commerce-font-display)" }}
        >
          My Wishlist
        </h1>

        <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-[262px_1fr]">
          <AccountSidebar
            displayName={displayName}
            email={email}
            role={role}
            imageUrl={imageUrl}
            pendingReviewCount={pendingReviewCount}
          />

          <main className="min-w-0">
            <div className="mt-6 lg:mt-0">
              <LikeListSection items={items} />
            </div>

            <div className="mt-10">
              <AccountPagination page={page} totalPages={totalPages} />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

