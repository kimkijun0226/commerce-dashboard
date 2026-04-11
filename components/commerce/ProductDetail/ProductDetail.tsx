import { ProductDetailMedia } from "@/components/commerce/ProductDetail/ProductDetailMedia";
import { ProductDetailSidebar } from "@/components/commerce/ProductDetail/ProductDetailSidebar";
import type { ProductDetailData } from "@/features/products/api/useProductDetail";
import { toCommonsProductDetail } from "@/features/products/api/useProductDetail";

export type ProductDetailProps = {
  product: ProductDetailData;
};

export function ProductDetail({ product }: ProductDetailProps) {
  const detail = toCommonsProductDetail(product);

  return (
    <div className="mx-auto max-w-[960px] px-4 py-10 sm:px-8">
      <div className="grid gap-10 md:grid-cols-2 md:gap-12">
        <ProductDetailMedia
          imageUrl={product.imageUrl || null}
          alt={product.name}
        />
        <ProductDetailSidebar product={detail} />
      </div>
    </div>
  );
}
