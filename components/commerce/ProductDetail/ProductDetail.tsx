import { ProductInfoSection } from "@/components/commerce/product/ProductInfoSection";
import type { ProductDetailData } from "@/features/products/api/useProductDetail";
import { toCommonsProductDetail } from "@/features/products/api/useProductDetail";
import Image from "next/image";

export type ProductDetailProps = {
  product: ProductDetailData;
};

export function ProductDetail({ product }: ProductDetailProps) {
  return (
    <div className="mx-auto max-w-[960px] px-4 py-10 sm:px-8">
      <div className="grid gap-10 md:grid-cols-2 md:gap-12">
        <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-(--commerce-background-light)">
          {product.imageUrl ? (
            <Image
              src={product.imageUrl}
              alt=""
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 480px"
              unoptimized={
                product.imageUrl.startsWith("http://") ||
                product.imageUrl.startsWith("https://")
              }
              priority
            />
          ) : (
            <div className="flex size-full items-center justify-center text-(--commerce-text-secondary)">
              이미지 없음
            </div>
          )}
        </div>

        <ProductInfoSection product={toCommonsProductDetail(product)} />
      </div>
    </div>
  );
}
