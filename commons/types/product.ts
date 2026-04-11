import type { ProductReviewSummary } from "@/commons/types/product-review-summary";

export interface ProductCategory {
  id: string;
  name: string;
}

export interface ProductDetail {
  id: string;
  name: string;
  description: string | null;
  price: number;
  salePrice?: number;
  image_url: string | null;
  status: "registered" | "hidden" | "sold_out";
  created_at: string | null;
  updated_at: string | null;
  additional_info?: string | null;
  measurements?: string | null;
  categories?: ProductCategory[] | null;
  rating?: number;
  reviewCount?: number;
  /** `products.review_summary` (리뷰 수·한 줄 요약) */
  reviewSummary?: ProductReviewSummary | null;
}

const PRODUCT_STATUS = ["registered", "hidden", "sold_out"] as const;

export function isProductDetail(value: unknown): value is ProductDetail {
  if (value === null || typeof value !== "object") return false;
  const o = value as Record<string, unknown>;
  return (
    typeof o.id === "string" &&
    typeof o.name === "string" &&
    (o.description === null || typeof o.description === "string") &&
    typeof o.price === "number" &&
    (o.image_url === null || typeof o.image_url === "string") &&
    PRODUCT_STATUS.includes(o.status as (typeof PRODUCT_STATUS)[number]) &&
    (o.created_at === null || typeof o.created_at === "string") &&
    (o.updated_at === null || typeof o.updated_at === "string")
  );
}
