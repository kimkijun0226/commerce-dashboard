import type { ReviewWriteEligibility } from "@/app/(commerce)/products/[productId]/review-actions";
import { ProductDetailExtraInfoPanel } from "@/app/(commerce)/products/[productId]/_components/ProductDetailExtraInfoPanel";
import { ProductDetailImageGallery } from "@/app/(commerce)/products/[productId]/_components/ProductDetailImageGallery";
import { ProductReviewsSection } from "@/app/(commerce)/products/[productId]/_components/ProductReviewsSection";
import { ProductDetailTabs } from "@/app/(commerce)/products/[productId]/_components/ProductDetailTabs";
import { ReviewSummaryDisplay } from "@/app/(commerce)/products/[productId]/_components/ReviewSummaryDisplay";
import { ProductDetailMedia } from "@/components/commerce/ProductDetail/ProductDetailMedia";
import { ProductDetailSidebar } from "@/components/commerce/ProductDetail/ProductDetailSidebar";
import type { ProductDetailData } from "@/features/products/api/useProductDetail";
import { toCommonsProductDetail } from "@/features/products/api/useProductDetail";

export type ProductDetailProps = {
  product: ProductDetailData;
  reviewWriteEligibility: ReviewWriteEligibility;
  /** 리뷰 탭을 처음부터 열지 (예: ?openReview=1) */
  defaultReviewsTab?: boolean;
  initialReviewOrderId?: string | null;
};

export function ProductDetail({
  product,
  reviewWriteEligibility,
  defaultReviewsTab = false,
  initialReviewOrderId = null,
}: ProductDetailProps) {
  const detail = toCommonsProductDetail(product);

  return (
    <div className="mx-auto max-w-[1120px] px-4 py-10 sm:px-8">
      <div className="grid gap-10 md:grid-cols-2 md:gap-12">
        <ProductDetailMedia
          imageUrl={product.imageUrl || null}
          alt={product.name}
        />
        <ProductDetailSidebar product={detail} />
      </div>

      <div className="mt-10">
        <ReviewSummaryDisplay />
      </div>

      <div className="mt-14 w-full pt-10">
        <ProductDetailTabs
          defaultTab={defaultReviewsTab ? "reviews" : "product-detail"}
          productDetailContent={
            <ProductDetailImageGallery
              imageUrls={product.detailImageUrls}
              imageAltBase={product.name}
            />
          }
          extraInfoContent={
            <ProductDetailExtraInfoPanel
              measurements={product.measurements}
              additionalInfo={product.additionalInfo}
            />
          }
          reviewsContent={
            <ProductReviewsSection
              productId={product.id}
              reviewWriteEligibility={reviewWriteEligibility}
              initialComposerOpen={
                defaultReviewsTab && reviewWriteEligibility.canCreate
              }
              initialReviewOrderId={initialReviewOrderId}
            />
          }
        />
      </div>
    </div>
  );
}
