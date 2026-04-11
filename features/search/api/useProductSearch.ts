"use client";

import { useQuery } from "@tanstack/react-query";

import type { Product } from "@/components/commerce/types";
import { useDebouncedValue } from "@/commons/hooks/useDebouncedValue";
import { parseProductReviewSummary } from "@/commons/types/product-review-summary";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { Database } from "@/types/supabase";

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

export function useProductSearch(keyword: string) {
  const debouncedKeyword = useDebouncedValue(keyword.trim(), 350);

  return useQuery<Product[]>({
    queryKey: ["products", "search", debouncedKeyword],
    enabled: debouncedKeyword.length > 0,
    queryFn: async () => {
      const supabase = getSupabaseBrowserClient();
      const q = escapeIlike(debouncedKeyword);

      const { data, error } = await supabase
        .from("products")
        .select(
          "id, name, description, price, sale_price, image_url, status, rating_average, review_summary",
        )
        .neq("status", "hidden")
        .or(`name.ilike.%${q}%,description.ilike.%${q}%`);

      if (error) {
        throw new Error(`상품 검색 실패: ${error.message}`);
      }

      return (data ?? []).map((row) => mapProduct(row as ProductsRow));
    },
  });
}

