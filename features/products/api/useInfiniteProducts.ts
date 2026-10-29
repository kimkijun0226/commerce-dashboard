"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/commons/constants/query-keys";
import type { Product } from "@/components/commerce/types";
import { CATALOG_PAGE_SIZE } from "@/lib/catalog/constants";

type CatalogPage = { items: Product[]; hasMore: boolean; total: number };

async function fetchCatalogPage(page: number, q: string, category: string, signal: AbortSignal): Promise<CatalogPage> {
  const params = new URLSearchParams({ page: String(page), pageSize: String(CATALOG_PAGE_SIZE) });
  if (q) params.set("q", q);
  if (category) params.set("category", category);
  const res = await fetch(`/api/catalog/products?${params}`, { signal });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || "상품 목록 조회 실패");
  }
  return res.json();
}

export function useInfiniteProducts(options?: {
  initialItems?: Product[];
  initialTotal?: number;
  q?: string;
  category?: string;
}) {
  const q = options?.q?.trim() ?? "";
  const category = options?.category ?? "";
  return useInfiniteQuery<CatalogPage>({
    queryKey: [...QUERY_KEYS.products.all, "infinite", q, category],
    initialPageParam: 0,
    queryFn: ({ pageParam, signal }) => fetchCatalogPage(Number(pageParam), q, category, signal),
    getNextPageParam: (lastPage, allPages) => lastPage.hasMore ? allPages.length : undefined,
    initialData: options?.initialItems && !q && !category
      ? {
        pageParams: [0],
        pages: [{
          items: options.initialItems,
          total: options.initialTotal ?? options.initialItems.length,
          hasMore: options.initialTotal !== undefined
            ? options.initialItems.length < options.initialTotal
            : options.initialItems.length === CATALOG_PAGE_SIZE,
        }],
      }
      : undefined,
  });
}
