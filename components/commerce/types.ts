import type { ProductReviewSummary } from "@/commons/types/product-review-summary";

export interface Product {
  id: string;
  name: string;
  price: number;
  salePrice?: number;
  imageUrl: string;
  rating?: number;
  reviewCount?: number;
  reviewSummary?: ProductReviewSummary | null;
  isLiked?: boolean;
}

export interface CartItem {
  productId: string;
  quantity: number;
  unitPrice: number;
  name?: string;
  imageUrl?: string;
  /** 예: Color: Black */
  variantLabel?: string;
}

/** 주문 요약 패널 행 */
export interface OrderSummaryLine {
  id: string;
  label: string;
  amount: number;
  muted?: boolean;
}
