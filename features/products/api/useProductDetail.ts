import type { ProductDetail } from "@/commons/types/product";
import {
  type ProductReviewSummary,
  parseProductReviewSummary,
} from "@/commons/types/product-review-summary";
import { createClient } from "@/lib/supabase/server";
import type { Database, Json } from "@/types/supabase";

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
  measurements: string | null;
  categories: string[] | null;
  /** `products.additional_info` — JSON 객체 (추가정보 탭 표) */
  additionalInfo: Json;
  /** `products.detail_image_urls` — 상세 이미지 탭 */
  detailImageUrls: string[];
  created_at: string;
  updated_at: string;
  reviewSummary: ProductReviewSummary | null;
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
    measurements: row.measurements,
    categories: row.categories,
    additionalInfo: row.additional_info ?? {},
    detailImageUrls: row.detail_image_urls ?? [],
    created_at: row.created_at,
    updated_at: row.updated_at,
    reviewSummary: parseProductReviewSummary(row.review_summary),
  };
}

/** `ProductInfoSection` 등 커머스 UI용 `ProductDetail` 변환 */
export function toCommonsProductDetail(p: ProductDetailData): ProductDetail {
  return {
    id: p.id,
    name: p.name,
    description: p.description,
    price: p.price,
    salePrice: p.salePrice ?? undefined,
    image_url: p.imageUrl || null,
    status: p.status,
    created_at: p.created_at,
    updated_at: p.updated_at,
    measurements: p.measurements,
    categories:
      p.categories && p.categories.length > 0
        ? p.categories.map((name, i) => ({
            id: `cat-${i}-${name}`,
            name,
          }))
        : null,
    rating: p.rating ?? undefined,
    reviewCount: undefined,
    reviewSummary: p.reviewSummary,
    additional_info: p.additionalInfo,
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
