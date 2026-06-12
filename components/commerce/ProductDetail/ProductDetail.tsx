// 상품 기본 정보와 탭 영역을 조합해 상세 페이지 본문 레이아웃을 만듭니다.
import type { ReviewWriteEligibility } from "@/app/(commerce)/products/[productId]/review-actions";
import { ProductDetailExtraInfoPanel } from "@/app/(commerce)/products/[productId]/_components/ProductDetailExtraInfoPanel";
import { ProductDetailImageGallery } from "@/app/(commerce)/products/[productId]/_components/ProductDetailImageGallery";
import { ProductReviewsSection } from "@/app/(commerce)/products/[productId]/_components/ProductReviewsSection";
import { ProductDetailTabs } from "@/app/(commerce)/products/[productId]/_components/ProductDetailTabs";
import { ProductDetailMedia } from "@/components/commerce/ProductDetail/ProductDetailMedia";
import { ProductDetailSidebar } from "@/components/commerce/ProductDetail/ProductDetailSidebar";
import type { ProductDetailData } from "@/features/products/api/useProductDetail";
import { toCommonsProductDetail } from "@/features/products/api/useProductDetail";
import type { ReactNode } from "react";

export type ProductDetailProps = {
  product: ProductDetailData;
  reviewWriteEligibility: ReviewWriteEligibility;
  /** `?openReview=1` 등으로 들어왔을 때만 작성 폼을 바로 펼침 (`tab=reviews`만으로는 펼치지 않음) */
  initialComposerOpen?: boolean;
  initialReviewOrderId?: string | null;
  reviewSummarySection?: ReactNode;
  reviewListSection?: ReactNode;
};

// 상세 미디어, 사이드바, 탭 영역을 조합해 PDP 본문 전체를 구성합니다.
export function ProductDetail({
  product,
  reviewWriteEligibility,
  initialComposerOpen = false,
  initialReviewOrderId = null,
  reviewSummarySection,
  reviewListSection,
}: ProductDetailProps) {
  // 공용 커머스 사이드바 컴포넌트가 받는 형태로 상세 데이터를 변환합니다.
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

      <div className="mt-14 w-full pt-10">
        <ProductDetailTabs
          defaultTab="reviews"
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
              initialComposerOpen={initialComposerOpen}
              initialReviewOrderId={initialReviewOrderId}
              reviewSummarySection={reviewSummarySection}
              reviewListSection={reviewListSection}
            />
          }
        />
      </div>
    </div>
  );
}
