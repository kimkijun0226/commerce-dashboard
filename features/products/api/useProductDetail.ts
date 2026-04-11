import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/supabase";

type ProductsRow = Database["public"]["Tables"]["products"]["Row"];

/** 상품 상세 페이지용 데이터 (Supabase Row 매핑) */
export type ProductDetailData = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  salePrice: number | null;
  imageUrl: string;
  rating: number | null;
  status: ProductsRow["status"];
};

function mapRow(row: ProductsRow): ProductDetailData {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    price: row.price,
    salePrice: row.sale_price,
    imageUrl: row.image_url ?? "",
    rating: row.rating_average,
    status: row.status,
  };
}

/**
 * 단일 상품 조회 (Server Component / generateMetadata 등에서 사용)
 * - 없거나 `hidden`이면 `null`
 * - Supabase 오류는 throw
 */
export async function getProductById(
  productId: string,
): Promise<ProductDetailData | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", productId)
    .maybeSingle();

  if (error) {
    throw new Error(`상품 조회 실패: ${error.message}`);
  }

  if (!data) return null;

  const row = data as ProductsRow;
  if (row.status === "hidden") return null;

  return mapRow(row);
}
