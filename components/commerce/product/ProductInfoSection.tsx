"use client";

import type { ProductDetail } from "@/commons/types/product";
import type { CartProduct, ProductStatus } from "@/commons/store/cart-store";
import { useCartStore } from "@/commons/store/cart-store";
import { AddToCartSection } from "@/components/commerce/AddToCartSection/AddToCartSection";
import { RatingStars } from "@/components/commerce/RatingStars/RatingStars";
import { useProductRating } from "@/features/products/hooks/useProductRating";
import { cn } from "@/components/ui";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

const DEFAULT_MEASUREMENTS = "—";
const DEFAULT_CATEGORIES = "—";

function toCartProduct(product: ProductDetail): CartProduct {
  let status: ProductStatus = "visible";
  if (product.status === "hidden") status = "hidden";
  else if (product.status === "sold_out") status = "sold_out";

  return {
    id: product.id,
    name: product.name,
    price: product.price,
    salePrice: product.salePrice ?? null,
    imageUrl: product.image_url,
    status,
  };
}

function formatPrice(n: number, currency = "₩") {
  return `${currency}${n.toLocaleString("ko-KR")}`;
}

export type ProductInfoSectionProps = {
  product: ProductDetail;
  className?: string;
};

export function ProductInfoSection({ product, className }: ProductInfoSectionProps) {
  const { rating, reviewCount, showReviewCount } = useProductRating(product);
  const router = useRouter();
  const addItem = useCartStore((s) => s.addItem);
  const [quantity, setQuantity] = useState(1);
  const [wishlisted, setWishlisted] = useState(false);

  useEffect(() => {
    setQuantity(1);
  }, [product.id]);

  const cartDisabled =
    product.status === "hidden" || product.status === "sold_out";

  const handleAddToCart = useCallback(() => {
    if (cartDisabled) return;
    addItem(toCartProduct(product), quantity);
    router.push("/cart");
  }, [addItem, cartDisabled, product, quantity, router]);

  const handleWishlistToggle = useCallback(() => {
    setWishlisted((v) => !v);
  }, []);

  const displayPrice = product.salePrice ?? product.price;
  const hasDiscount =
    product.salePrice !== undefined && product.salePrice < product.price;

  const measurements =
    product.measurements?.trim() || DEFAULT_MEASUREMENTS;

  const categoryLine =
    product.categories && product.categories.length > 0
      ? product.categories.map((c) => c.name).join(", ")
      : DEFAULT_CATEGORIES;

  return (
    <section
      className={cn("flex flex-col gap-6", className)}
      aria-label="상품 정보"
    >
      <div className="flex flex-col gap-2 border-b border-(--commerce-border-subtle) pb-6">
        <div className="flex flex-wrap items-center gap-2">
          <RatingStars value={Math.min(5, Math.max(0, rating))} size="sm" />
          {showReviewCount ? (
            <span
              className="text-[12px] leading-5 text-(--commerce-text-primary)"
              style={{ fontFamily: "var(--commerce-font-body)" }}
            >
              {reviewCount} Reviews
            </span>
          ) : null}
        </div>

        <h1
          className="text-[40px] font-medium leading-[44px] tracking-[-0.4px] text-(--commerce-text-primary)"
          style={{ fontFamily: "var(--commerce-font-heading)" }}
        >
          {product.name}
        </h1>

        {product.description ? (
          <p
            className="text-base font-normal leading-[26px] text-(--commerce-text-tertiary)"
            style={{ fontFamily: "var(--commerce-font-body)" }}
          >
            {product.description}
          </p>
        ) : null}

        <div className="flex flex-wrap items-baseline gap-2">
          <span
            className="text-[28px] font-medium leading-[34px] tracking-[-0.6px] text-(--commerce-text-primary)"
            style={{ fontFamily: "var(--commerce-font-heading)" }}
          >
            {formatPrice(displayPrice)}
          </span>
          {hasDiscount ? (
            <span
              className="text-[20px] font-medium leading-7 text-(--commerce-text-secondary) line-through"
              style={{ fontFamily: "var(--commerce-font-heading)" }}
            >
              {formatPrice(product.price)}
            </span>
          ) : null}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <span
          className="text-sm font-semibold leading-5 text-(--commerce-text-secondary)"
          style={{ fontFamily: "var(--commerce-font-body)" }}
        >
          Measurements
        </span>
        <span
          className="text-sm font-normal leading-5 text-(--commerce-text-primary)"
          style={{ fontFamily: "var(--commerce-font-body)" }}
        >
          {measurements}
        </span>
      </div>

      <AddToCartSection
        variant="pdp"
        quantity={quantity}
        onQuantityChange={setQuantity}
        onAddToCart={handleAddToCart}
        onWishlistToggle={handleWishlistToggle}
        wishlisted={wishlisted}
        disabled={cartDisabled}
      />

      <div className="flex flex-col gap-2 border-t border-(--commerce-border-subtle) pt-6">
        <span
          className="text-[12px] font-normal uppercase leading-5 text-(--commerce-text-secondary)"
          style={{ fontFamily: "var(--commerce-font-body)" }}
        >
          CATEGORY
        </span>
        <span
          className="text-[12px] font-normal leading-5 text-(--commerce-text-primary)"
          style={{ fontFamily: "var(--commerce-font-body)" }}
        >
          {categoryLine}
        </span>
      </div>
    </section>
  );
}
