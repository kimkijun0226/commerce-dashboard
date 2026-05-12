"use client";

import { useInfiniteQuery } from "@tanstack/react-query";

import { QUERY_KEYS } from "@/commons/constants/query-keys";
import type { Product } from "@/components/commerce/types";
import { CATALOG_PAGE_SIZE } from "@/lib/catalog/constants";

async function fetchCatalogPage(page: number, pageSize: number) {
  const res = await fetch(
    `/api/catalog/products?page=${encodeURIComponent(String(page))}&pageSize=${encodeURIComponent(String(pageSize))}`,
    { method: "GET" },
  );
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || "상품 목록 조회 실패");
  }
  const json = (await res.json()) as { items?: Product[] };
  return { items: json.items ?? [] };
}

export function useInfiniteProducts(options?: { initialItems?: Product[] }) {
  return useInfiniteQuery<{ items: Product[] }>({
    queryKey: [...QUERY_KEYS.products.all, "infinite"],
    initialPageParam: 0,
    queryFn: async ({ pageParam }) => {
      return fetchCatalogPage(Number(pageParam), CATALOG_PAGE_SIZE);
    },
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.items.length < CATALOG_PAGE_SIZE) return undefined;
      return allPages.length;
    },
    initialData: options?.initialItems
      ? { pageParams: [0], pages: [{ items: options.initialItems }] }
      : undefined,
  });
}

