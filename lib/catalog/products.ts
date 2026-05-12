import { parseProductReviewSummary } from "@/commons/types/product-review-summary";
import type { Product } from "@/components/commerce/types";
import { CATALOG_PAGE_SIZE, CATALOG_SEARCH_PAGE_SIZE } from "@/lib/catalog/constants";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/supabase";

export { CATALOG_PAGE_SIZE, CATALOG_SEARCH_PAGE_SIZE } from "@/lib/catalog/constants";

type ProductsRow = Database["public"]["Tables"]["products"]["Row"];

function mapProduct(row: ProductsRow): Product {
  return {
    id: row.id,
    name: row.name,
    price: row.price,
    salePrice: row.sale_price ?? undefined,
    imageUrl: row.image_url ?? "",
    rating: row.rating_average ?? undefined,
    reviewCount: undefined,
    reviewSummary: parseProductReviewSummary(row.review_summary),
  };
}

function escapeIlike(value: string) {
  // Supabase filter 문자열에서 %/_가 wildcard이므로 최소한으로 escape
  return value.replaceAll("%", "\\%").replaceAll("_", "\\_");
}

function normalizeSpaces(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

function removeAllSpaces(value: string) {
  return value.replace(/\s+/g, "");
}

function spacesToWildcard(value: string) {
  // "보조 배터리" -> "보조%배터리" (띄어쓰기/붙여쓰기 모두 매칭)
  return normalizeSpaces(value).replace(/\s+/g, "%");
}

export type CatalogProductsParams = {
  page?: number;
  pageSize?: number;
  q?: string;
};

export async function getCatalogProducts(params: CatalogProductsParams = {}) {
  const page = Math.max(0, Math.floor(Number(params.page ?? 0) || 0));
  const pageSize = Math.max(
    1,
    Math.min(200, Math.floor(Number(params.pageSize ?? CATALOG_PAGE_SIZE) || 0)),
  );
  const q = String(params.q ?? "").trim();

  const supabase = await createClient();
  const offset = page * pageSize;

  const base = supabase
    .from("products")
    .select(
      "id, name, description, price, sale_price, image_url, status, rating_average, review_summary, created_at",
    )
    .neq("status", "hidden");

  const query = q.length
    ? (() => {
        const spaced = normalizeSpaces(q);
        const noSpace = removeAllSpaces(spaced);
        const fuzzy = spacesToWildcard(spaced);
        const q1 = escapeIlike(spaced);
        const q2 = escapeIlike(noSpace);
        const q3 = escapeIlike(fuzzy);

        const parts = [`name.ilike.%${q1}%`, `description.ilike.%${q1}%`];
        if (q2 && noSpace !== spaced) {
          parts.push(`name.ilike.%${q2}%`, `description.ilike.%${q2}%`);
        }
        if (q3 && fuzzy !== spaced) {
          parts.push(`name.ilike.%${q3}%`, `description.ilike.%${q3}%`);
        }
        return base.or(parts.join(","));
      })()
    : base;

  const { data, error } = await query
    .order("created_at", { ascending: false })
    // created_at이 동일한 경우에도 순서가 고정되도록 tie-breaker 추가
    .order("id", { ascending: false })
    .range(offset, offset + pageSize - 1);

  if (error) {
    throw new Error(
      q.length ? `상품 검색 실패: ${error.message}` : `상품 목록 조회 실패: ${error.message}`,
    );
  }

  return {
    items: (data ?? []).map((row) => mapProduct(row as ProductsRow)),
    page,
    pageSize,
    hasMore: (data ?? []).length === pageSize,
  };
}

