"use client";

import type { ProductDetail } from "@/commons/types/product";
import { AddToCartSection } from "@/components/commerce/product/AddToCartSection";
import { RatingStars } from "@/components/commerce/RatingStars/RatingStars";
import { useProductReviews } from "@/features/products/hooks/useProductReviews";
import { cn } from "@/components/ui";

const DEFAULT_MEASUREMENTS = "—";
const DEFAULT_CATEGORIES = "—";

function formatPrice(n: number, currency = "₩") {
  return `${currency}${n.toLocaleString("ko-KR")}`;
}

export type ProductInfoSectionProps = {
  product: ProductDetail;
  className?: string;
};

export function ProductInfoSection({ product, className }: ProductInfoSectionProps) {
  const { reviewCount, ratingDisplay, hasReviews, isPending } =
    useProductReviews(product.id);

  const displayPrice = product.salePrice ?? product.price;
  const hasDiscount =
    product.salePrice !== undefined && product.salePrice < product.price;

  const measurements = product.measurements?.trim() || DEFAULT_MEASUREMENTS;

  const categoryLine =
    product.categories && product.categories.length > 0
      ? product.categories.map((c) => c.name).join(", ")
      : DEFAULT_CATEGORIES;

  return (
    <section
      className={cn("flex min-w-0 max-w-full flex-col gap-6", className)}
      aria-label="상품 정보"
    >
      <div className="flex flex-col gap-2 border-b border-(--commerce-border-subtle) pb-6">
        <div className="flex flex-wrap items-center gap-2">
          <RatingStars
            value={isPending ? 0 : ratingDisplay}
            size="sm"
          />
          {hasReviews ? (
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

      <AddToCartSection key={product.id} product={product} />

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
