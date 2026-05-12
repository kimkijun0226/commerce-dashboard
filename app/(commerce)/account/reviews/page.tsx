import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ACCOUNT_URLS, COMMERCE_URLS } from "@/commons/constants/url";
import { AccountSidebar } from "@/components/account/AccountSidebar/AccountSidebar";
import type { UserRole } from "@/types/supabase";
import type { Review } from "@/features/products/api/useProductReviews";
import { getPendingReviewSlotsForUser } from "@/app/(commerce)/account/reviews/pending-queries";
import { MyReviewsSection } from "@/components/commerce/MyReviewsSection/MyReviewsSection";
import type { MyReviewListModel } from "@/components/commerce/MyReviewsSection/types";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 10;

type ReviewRow = {
  id: string;
  user_id: string;
  product_id: string;
  order_id: string;
  rating: number;
  content: string | null;
  created_at: string;
};

type ProductRow = {
  id: string;
  name: string;
  image_url: string | null;
};

function formatSupabaseError(
  prefix: string,
  error: {
    message?: string;
    details?: string | null;
    hint?: string | null;
    code?: string;
  },
): string {
  const parts = [prefix];
  if (error.code) parts.push(`code=${error.code}`);
  if (error.message) parts.push(error.message);
  if (error.details) parts.push(`details=${error.details}`);
  if (error.hint) parts.push(`hint=${error.hint}`);
  return parts.join(" | ");
}

function mapRow(
  row: ReviewRow,
  selfUser: NonNullable<Review["users"]>,
  product: ProductRow | undefined,
): MyReviewListModel {
  const productBlock = product
    ? {
        id: product.id,
        name: String(product.name ?? ""),
        imageUrl: product.image_url ?? null,
      }
    : null;

  return {
    productId: row.product_id,
    product: productBlock,
    review: {
      id: row.id,
      user_id: row.user_id,
      rating: row.rating,
      content: row.content,
      created_at: row.created_at,
      users: selfUser,
    },
  };
}

export default async function AccountReviewsPage({
  searchParams,
}: {
  searchParams?:
    | Record<string, string | string[] | undefined>
    | Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await Promise.resolve(searchParams ?? {});
  const raw = sp.page;
  const page = Math.max(1, Number(Array.isArray(raw) ? raw[0] : raw ?? "1") || 1);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email) {
    redirect(`/login?next=${encodeURIComponent(ACCOUNT_URLS.REVIEWS)}`);
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

  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const { data: reviewRows, count, error } = await supabase
    .from("reviews")
    .select("id, user_id, product_id, order_id, rating, content, created_at", {
      count: "exact",
    })
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) {
    throw new Error(formatSupabaseError("리뷰 목록을 불러오지 못했습니다", error));
  }

  const reviews = (reviewRows ?? []) as ReviewRow[];
  const productIds = [...new Set(reviews.map((r) => r.product_id))];

  const productsById = new Map<string, ProductRow>();
  if (productIds.length > 0) {
    const { data: productRows, error: productError } = await supabase
      .from("products")
      .select("id, name, image_url")
      .in("id", productIds);

    if (productError) {
      throw new Error(
        formatSupabaseError("리뷰 상품 정보를 불러오지 못했습니다", productError),
      );
    }
    for (const p of (productRows ?? []) as ProductRow[]) {
      productsById.set(p.id, p);
    }
  }

  const selfUser: NonNullable<Review["users"]> = {
    display_name: displayName,
    email: email || user.email || "",
    image_url: imageUrl,
  };

  const rows: MyReviewListModel[] = reviews.map((row) =>
    mapRow(row, selfUser, productsById.get(row.product_id)),
  );

  const total = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  if (page > totalPages) {
    redirect(`${ACCOUNT_URLS.REVIEWS}?page=${totalPages}`);
  }

  const pendingSlots = await getPendingReviewSlotsForUser();

  return (
    <div className="bg-(--commerce-background-default) pb-16 pt-6 sm:pt-10">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-[160px]">
        <div className="flex items-end justify-between gap-6">
          <h1
            className="text-[40px] font-medium leading-[48px] tracking-[-1px] text-black sm:text-[54px] sm:leading-[58px]"
            style={{ fontFamily: "var(--commerce-font-heading)" }}
          >
            내 상품평
          </h1>
          <Link
            href={COMMERCE_URLS.PRODUCTS}
            aria-label="상품 목록으로 이동"
            className="text-[14px] font-semibold leading-[22px] text-(--commerce-text-secondary) hover:text-(--commerce-text-primary) focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--commerce-semantic-info)"
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
            pendingReviewCount={pendingSlots.length}
          />
          <main className="min-w-0 flex-1 lg:pl-4">
            <MyReviewsSection
              pendingSlots={pendingSlots}
              reviews={rows}
              totalWrittenCount={total}
              totalPages={totalPages}
              currentPage={page}
              currentUserId={user.id}
            />
          </main>
        </div>
      </div>
    </div>
  );
}
