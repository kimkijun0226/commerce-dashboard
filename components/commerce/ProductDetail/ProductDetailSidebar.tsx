"use client";

import { AddToCartSection } from "@/components/commerce/product/AddToCartSection";
import { ProductDetailCategorySection } from "@/components/commerce/product/ProductDetailCategorySection";
import { ProductInfoSection } from "@/components/commerce/product/ProductInfoSection";
import type { ProductDetail } from "@/commons/types/product";

export type ProductDetailSidebarProps = {
  product: ProductDetail;
};

export function ProductDetailSidebar({ product }: ProductDetailSidebarProps) {
  return (
    <div className="flex min-w-0 flex-col gap-6">
      <ProductInfoSection product={product} />
      <AddToCartSection key={product.id} product={product} />
      <ProductDetailCategorySection product={product} />
    </div>
  );
}
