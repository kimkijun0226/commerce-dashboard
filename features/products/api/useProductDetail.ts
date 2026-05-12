import type { ProductDetail } from "@/commons/types/product";
import {
  type ProductReviewSummary,
  parseProductReviewSummary,
} from "@/commons/types/product-review-summary";
import { createClient } from "@/lib/supabase/server";
import type { Database, Json } from "@/types/supabase";

type ProductsRow = Database["public"]["Tables"]["products"]["Row"];

function normalizeSupabaseErrorMessage(message: string): string {
  const m = message?.trim() ?? "";
  if (!m) return "알 수 없는 오류";
  // Cloudflare/502 등 HTML 에러 페이지가 섞여 들어오는 경우가 있어 잘라냅니다.
  if (m.startsWith("<!DOCTYPE html>") || m.startsWith("<html")) {
    return "일시적인 네트워크 오류(502)가 발생했습니다. 잠시 후 다시 시도해 주세요.";
  }
  if (m.includes("502") || m.toLowerCase().includes("bad gateway")) {
    return "일시적인 네트워크 오류(502)가 발생했습니다. 잠시 후 다시 시도해 주세요.";
  }
  // 너무 긴 메시지는 UI/로그를 망가뜨리니 제한
  return m.length > 300 ? `${m.slice(0, 300)}…` : m;
}

async function sleep(ms: number) {
  await new Promise((r) => setTimeout(r, ms));
}

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

  // 502 등 일시 장애에 대해 짧게 재시도(SSR/metadata에서 바로 터지는 것 방지)
  let lastErr: string | null = null;
  for (let attempt = 0; attempt < 2; attempt += 1) {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("id", productId)
      .maybeSingle();

    if (error) {
      const normalized = normalizeSupabaseErrorMessage(error.message);
      lastErr = normalized;
      // HTML/502 케이스만 재시도
      if (
        normalized.includes("502") ||
        normalized.includes("네트워크 오류")
      ) {
        await sleep(250 * (attempt + 1));
        continue;
      }
      throw new Error(`상품 조회 실패: ${normalized}`);
    }

    if (!data) return null;

    const row = data as ProductsRow;
    if (row.status === "hidden") return null;

    return mapRow(row);
  }

  throw new Error(`상품 조회 실패: ${lastErr ?? "알 수 없는 오류"}`);
}
