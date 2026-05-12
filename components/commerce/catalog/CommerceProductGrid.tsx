"use client";

import type { Product } from "@/components/commerce/types";
import { ProductGrid } from "@/components/commerce/ProductGrid/ProductGrid";
import { ProductCard } from "@/components/commerce/ProductCard/ProductCard";

export type CommerceProductGridProps = {
  products: Product[];
  loading?: boolean;
  columnsClassName?: string;
  gapClassName?: string;
  className?: string;
  onAddToCart: (product: Product) => void;
  onWishlistToggle?: (productId: string) => void;
};

export function CommerceProductGrid({
  products,
  loading,
  columnsClassName,
  gapClassName,
  className,
  onAddToCart,
  onWishlistToggle,
}: CommerceProductGridProps) {
  return (
    <ProductGrid
      className={className}
      products={products}
      columnsClassName={columnsClassName}
      gapClassName={gapClassName}
      loading={loading}
      renderItem={(p) => (
        <ProductCard
          product={p}
          onAddToCart={() => onAddToCart(p)}
          onWishlistToggle={
            onWishlistToggle ? () => onWishlistToggle(p.id) : undefined
          }
        />
      )}
    />
  );
}
