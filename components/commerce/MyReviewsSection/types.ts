import type { Review } from "@/features/products/api/useProductReviews";

/** 마이페이지 리뷰 목록 한 행 */
export type MyReviewListModel = {
  review: Review;
  productId: string;
  product: { id: string; name: string; imageUrl: string | null } | null;
};
