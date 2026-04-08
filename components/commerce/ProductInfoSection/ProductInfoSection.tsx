"use client";

import { commerceColors } from "@/commons/constants/color";
import { commerceTypography } from "@/commons/constants/typography";
import type { Product } from "@/components/commerce/types";
import { RatingStars } from "../RatingStars/RatingStars";
import { cn, typographyToStyle } from "@/components/ui";
import type { ReactNode } from "react";

export type ProductInfoSectionProps = {
  product: Pick<
    Product,
    "id" | "name" | "price" | "salePrice" | "rating" | "reviewCount"
  > & {
    description?: string;
  };
  currency?: string;
  metaSlot?: ReactNode;
  className?: string;
};

function formatMoney(n: number, currency = "₩") {
  return `${currency}${n.toLocaleString("ko-KR")}`;
}

export function ProductInfoSection({
  product,
  currency = "₩",
  metaSlot,
  className,
}: ProductInfoSectionProps) {
  const hasSale =
    product.salePrice !== undefined && product.salePrice < product.price;

  return (
    <section className={cn("flex flex-col gap-3", className)}>
      <header className="flex flex-col gap-2">
        <h1
          style={{
            ...typographyToStyle(commerceTypography.headline6),
            color: commerceColors.text.primary,
          }}
        >
          {product.name}
        </h1>

        <div className="flex flex-wrap items-center gap-2">
          {typeof product.rating === "number" ? (
            <div className="flex items-center gap-2">
              <RatingStars value={product.rating} size="md" />
              {typeof product.reviewCount === "number" ? (
                <span
                  style={{
                    ...typographyToStyle(commerceTypography.caption2),
                    color: commerceColors.text.muted,
                  }}
                >
                  ({product.reviewCount.toLocaleString("ko-KR")})
                </span>
              ) : null}
            </div>
          ) : null}
          {metaSlot}
        </div>
      </header>

      <div className="flex items-baseline gap-2">
        <span
          style={{
            ...typographyToStyle(commerceTypography.body1Semi),
            color: commerceColors.text.primary,
          }}
        >
          {formatMoney(hasSale ? product.salePrice! : product.price, currency)}
        </span>
        {hasSale ? (
          <span
            style={{
              ...typographyToStyle(commerceTypography.body2),
              color: commerceColors.text.muted,
              textDecoration: "line-through",
            }}
          >
            {formatMoney(product.price, currency)}
          </span>
        ) : null}
      </div>

      {product.description ? (
        <p
          style={{
            ...typographyToStyle(commerceTypography.body2),
            color: commerceColors.text.secondary,
          }}
        >
          {product.description}
        </p>
      ) : null}
    </section>
  );
}

