"use client";

import { useQuery } from "@tanstack/react-query";

import { QUERY_KEYS } from "@/commons/constants/query-keys";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { Product } from "@/components/commerce/types";
import type { Database } from "@/types/supabase";

export type UseProductsParams = {
  limit?: number;
  search?: string; // 나중에 확장할 여지를 남김
};

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
  };
}

/**
 * 상품 목록 조회 훅
 *
 * 사용 예시:
 * ```typescript
 * const { data: products, isLoading, isError } = useProductsQuery({ limit: 20 });
 * if (isLoading) return <div>로딩 중...</div>;
 * if (isError) return <div>오류 발생</div>;
 * return <ProductGrid products={products ?? []} />;
 * ```
 */
export function useProductsQuery(params?: UseProductsParams) {
  return useQuery<Product[]>({
    queryKey: QUERY_KEYS.products.list(params || {}),
    enabled: true,
    queryFn: async () => {
      const supabase = getSupabaseBrowserClient();

      let query = supabase
        .from("products")
        .select(
          "id, name, price, sale_price, image_url, status, rating_average, created_at",
        )
        .neq("status", "hidden")
        .order("created_at", { ascending: false })
        // created_at이 동일한 경우에도 순서가 고정되도록 tie-breaker 추가
        .order("id", { ascending: false });

      if (params?.limit) {
        query = query.limit(params.limit);
      }

      // TODO: search 파라미터는 추후 full-text 검색/ILIKE 등으로 확장

      const { data, error } = await query;
      if (error) {
        throw new Error(`상품 목록 조회 실패: ${error.message}`);
      }

      return (data ?? []).map((row) => mapProduct(row as ProductsRow));
    },
  });
}
