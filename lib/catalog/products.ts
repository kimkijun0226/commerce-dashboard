import { parseStoreKey, type StoreKey } from "./storefront";
import { parseProductReviewSummary } from "@/commons/types/product-review-summary";
import { getProductDisplayName } from "@/commons/utils/productDisplay";
import { parseProductOptions } from "@/commons/utils/productOptions";
import type { Product } from "@/components/commerce/types";
import { CATALOG_PAGE_SIZE } from "@/lib/catalog/constants";
import { buildCatalogSearchFilter } from "@/lib/catalog/filters";
import { createPublicClient } from "@/lib/supabase/public";
import { unstable_cache } from "next/cache";
import type { Database } from "@/types/supabase";

export { CATALOG_PAGE_SIZE, CATALOG_SEARCH_PAGE_SIZE } from "@/lib/catalog/constants";

type ProductsRow = Database["public"]["Tables"]["products"]["Row"];

function mapProduct(row: ProductsRow): Product {
  return {
    id: row.id,
    department: parseStoreKey(row.department),
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

export const getCatalogCategories = unstable_cache(async (department: StoreKey = "fashion"): Promise<CatalogCategory[]> => {
  const supabase = createPublicClient();
  const { data, error } = await supabase.rpc("get_catalog_categories", { p_department: department });
  if (error) throw new Error(`카테고리 조회 실패: ${error.message}`);
  return (data ?? []).map((row) => ({ name: row.name, productCount: Number(row.product_count) }));
}, ["public-catalog-categories"], { revalidate: 30, tags: ["catalog"] });

export type CatalogProductsParams = {
  page?: number;
  pageSize?: number;
  q?: string;
  category?: string;
  department?: StoreKey;
};

export async function getCatalogProducts(params: CatalogProductsParams = {}) {
  const page = Math.max(0, Math.floor(Number(params.page ?? 0) || 0));
  const pageSize = Math.max(
    1,
    Math.min(200, Math.floor(Number(params.pageSize ?? CATALOG_PAGE_SIZE) || 0)),
  );
  const q = String(params.q ?? "").trim().slice(0, 200);
  const category = String(params.category ?? "").trim().slice(0, 100);

  return getCachedCatalogProducts(page, pageSize, q, category, parseStoreKey(params.department));
}

const getCachedCatalogProducts = unstable_cache(async (page: number, pageSize: number, q: string, category: string, department: StoreKey) => {
  const supabase = createPublicClient();
  const offset = page * pageSize;

  const columns = "department, id, name, price, sale_price, image_url, status, rating_average, review_summary, created_at, additional_info, options, search_text";
  const base = category
    ? supabase.rpc("get_catalog_category_products", { p_category: category, p_department: department }, { count: "exact" }).select(columns)
    : supabase.from("products").select(columns, { count: "exact" });
  const visible = base.neq("status", "hidden").eq("department", department);
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
}, ["public-catalog-products"], { revalidate: 30, tags: ["catalog"] });
