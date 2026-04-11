import { ProductDetailAdditionalInfo } from "@/app/(commerce)/products/[productId]/_components/ProductDetailAdditionalInfo";
import { ProductReviewsSection } from "@/app/(commerce)/products/[productId]/_components/ProductReviewsSection";
import { ProductDetailTabs } from "@/app/(commerce)/products/[productId]/_components/ProductDetailTabs";
import type { ProductReviewListItem } from "@/features/reviews/api/getProductReviews";
import { ProductDetailMedia } from "@/components/commerce/ProductDetail/ProductDetailMedia";
import { ProductDetailSidebar } from "@/components/commerce/ProductDetail/ProductDetailSidebar";
import type { ProductDetailData } from "@/features/products/api/useProductDetail";
import { toCommonsProductDetail } from "@/features/products/api/useProductDetail";

export type ProductDetailProps = {
  product: ProductDetailData;
  initialReviews: ProductReviewListItem[];
};

export function ProductDetail({ product, initialReviews }: ProductDetailProps) {
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

      <div className="mt-14 w-full border-t border-(--commerce-border-subtle) pt-10">
        <ProductDetailTabs
          additionalInfoContent={
            <ProductDetailAdditionalInfo
              additionalInfo={product.additionalInfo}
              imageAltBase={product.name}
            />
          }
          reviewsContent={
            <ProductReviewsSection
              productId={product.id}
              initialReviews={initialReviews}
            />
          }
        />
      </div>
    </div>
  );
}
