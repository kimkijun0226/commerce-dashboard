"use client";

import { canPrefetchImages, warmProductImage } from "@/commons/utils/productImage";

import { useCallback } from "react";
import { infiniteQueryOptions, useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/commons/constants/query-keys";
import type { Product } from "@/components/commerce/types";
import type { StoreKey } from "@/lib/catalog/storefront";
import { CATALOG_PAGE_SIZE } from "@/lib/catalog/constants";

export type CatalogPage = { items: Product[]; hasMore: boolean; total: number };

async function fetchCatalogPage(page: number, q: string, category: string, department: StoreKey, signal: AbortSignal): Promise<CatalogPage> {
  const params = new URLSearchParams({ page: String(page), pageSize: String(CATALOG_PAGE_SIZE), department });
  if (q) params.set("q", q);
  if (category) params.set("category", category);
  const res = await fetch(`/api/catalog/products?${params}`, { signal });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || "상품 목록 조회 실패");
  }
  return res.json();
}

function catalogQueryOptions(q: string, category: string, department: StoreKey) {
  return infiniteQueryOptions({
    gcTime: 10 * 60_000,
    queryKey: [...QUERY_KEYS.products.all, "infinite", department, q, category],
    initialPageParam: 0,
    queryFn: ({ pageParam, signal }) => fetchCatalogPage(pageParam, q, category, department, signal),
    getNextPageParam: (lastPage, allPages) => lastPage.hasMore ? allPages.length : undefined,
  });
}

export function usePrefetchCatalog(department: StoreKey = "fashion") {
  const client = useQueryClient();
  return useCallback(async (q: string, category: string, imageCount = 6) => {
    if (!canPrefetchImages()) return;
    const options = catalogQueryOptions(q.trim(), category, department);
    await client.prefetchInfiniteQuery(options);
    const result = client.getQueryData(options.queryKey);
    result?.pages[0]?.items.slice(0, imageCount).forEach((product) => warmProductImage(product.imageUrl));
  }, [client, department]);
}

export function useInfiniteProducts(options?: {
  initialItems?: Product[];
  initialTotal?: number;
  q?: string;
  category?: string;
  department?: StoreKey;
}) {
  const q = options?.q?.trim() ?? "";
  const category = options?.category ?? "";
  return useInfiniteQuery({
    ...catalogQueryOptions(q, category, options?.department ?? "fashion"),
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
