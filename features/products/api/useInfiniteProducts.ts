"use client";

import { useInfiniteQuery } from "@tanstack/react-query";

import { QUERY_KEYS } from "@/commons/constants/query-keys";
import { parseProductReviewSummary } from "@/commons/types/product-review-summary";
import type { Product } from "@/components/commerce/types";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { Database } from "@/types/supabase";

export const PAGE_SIZE = 12;

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

export function useInfiniteProducts() {
  return useInfiniteQuery<{ items: Product[] }>({
    queryKey: [...QUERY_KEYS.products.all, "infinite"],
    initialPageParam: 0,
    queryFn: async ({ pageParam }) => {
      const supabase = getSupabaseBrowserClient();
      const offset = Number(pageParam) * PAGE_SIZE;

      const { data, error } = await supabase
        .from("products")
        .select("*")
        .neq("status", "hidden")
        .order("created_at", { ascending: false })
        .range(offset, offset + PAGE_SIZE - 1);

      if (error) {
        throw new Error(`상품 목록 조회 실패: ${error.message}`);
      }

      return { items: (data ?? []).map((row) => mapProduct(row as ProductsRow)) };
    },
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.items.length < PAGE_SIZE) return undefined;
      return allPages.length;
    },
  });
}

