import { parseProductReviewSummary } from "@/commons/types/product-review-summary";
import { getProductDisplayName } from "@/commons/utils/productDisplay";
import { parseProductOptions } from "@/commons/utils/productOptions";
import type { Product } from "@/components/commerce/types";
import { CATALOG_PAGE_SIZE } from "@/lib/catalog/constants";
import { buildCatalogSearchFilter } from "@/lib/catalog/filters";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/supabase";

export { CATALOG_PAGE_SIZE, CATALOG_SEARCH_PAGE_SIZE } from "@/lib/catalog/constants";

type ProductsRow = Database["public"]["Tables"]["products"]["Row"];

function mapProduct(row: ProductsRow): Product {
  return {
    id: row.id,
    name: getProductDisplayName(row.name),
    brand: row.additional_info && typeof row.additional_info === "object" && !Array.isArray(row.additional_info) && typeof row.additional_info["브랜드"] === "string"
      ? row.additional_info["브랜드"] : undefined,
    options: parseProductOptions(row.options),
    price: row.price,
    salePrice: row.sale_price ?? undefined,
    imageUrl: row.image_url ?? "",
    rating: row.rating_average ?? undefined,
    reviewCount: parseProductReviewSummary(row.review_summary)?.count,
    reviewSummary: parseProductReviewSummary(row.review_summary),
  };
}

export type CatalogCategory = { name: string; productCount: number };

export async function getCatalogCategories(): Promise<CatalogCategory[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_catalog_categories");
  if (error) throw new Error(`카테고리 조회 실패: ${error.message}`);
  return (data ?? []).map((row) => ({ name: row.name, productCount: Number(row.product_count) }));
}

export type CatalogProductsParams = {
  page?: number;
  pageSize?: number;
  q?: string;
  category?: string;
};

export async function getCatalogProducts(params: CatalogProductsParams = {}) {
  const page = Math.max(0, Math.floor(Number(params.page ?? 0) || 0));
  const pageSize = Math.max(
    1,
    Math.min(200, Math.floor(Number(params.pageSize ?? CATALOG_PAGE_SIZE) || 0)),
  );
  const q = String(params.q ?? "").trim();
  const category = String(params.category ?? "").trim();

  const supabase = await createClient();
  const offset = page * pageSize;

  const columns = "id, name, price, sale_price, image_url, status, rating_average, review_summary, created_at, additional_info, options, search_text";
  const base = category
    ? supabase.rpc("get_catalog_category_products", { p_category: category }, { count: "exact" }).select(columns)
    : supabase.from("products").select(columns, { count: "exact" });
  const visible = base.neq("status", "hidden");
  const query = q ? visible.or(buildCatalogSearchFilter(q)) : visible;

  const { data, error, count } = await query
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
    total: count ?? 0,
    hasMore: offset + (data ?? []).length < (count ?? 0),
  };
}

