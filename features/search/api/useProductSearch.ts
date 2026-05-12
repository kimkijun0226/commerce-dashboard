"use client";

import { useQuery } from "@tanstack/react-query";

import type { Product } from "@/components/commerce/types";
import { useDebouncedValue } from "@/commons/hooks/useDebouncedValue";

export function useProductSearch(keyword: string) {
  const debouncedKeyword = useDebouncedValue(keyword.trim(), 350);

  return useQuery<Product[]>({
    queryKey: ["products", "search", debouncedKeyword],
    enabled: debouncedKeyword.length > 0,
    queryFn: async () => {
      const res = await fetch(
        `/api/catalog/products?q=${encodeURIComponent(debouncedKeyword)}&page=0`,
        { method: "GET" },
      );
      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(text || "상품 검색 실패");
      }
      const json = (await res.json()) as { items?: Product[] };
      return json.items ?? [];
    },
  });
}

