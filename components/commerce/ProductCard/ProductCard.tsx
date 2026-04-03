"use client";

import { getProductDetailUrl } from "@/commons/constants/url";
import { commerceColors } from "@/commons/constants/color";
import { commerceTypography } from "@/commons/constants/typography";
import type { Product } from "@/components/commerce/types";
import { Button, cn, typographyToStyle } from "@/components/ui";
import { RatingStars } from "../RatingStars/RatingStars";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

export type ProductCardProps = {
  product: Product;
  href?: string;
  onAddToCart?: () => void;
  onWishlistToggle?: () => void;
  badgeSlot?: ReactNode;
  loading?: boolean;
  className?: string;
};

function formatPrice(n: number, currency = "₩") {
  return `${currency}${n.toLocaleString("ko-KR")}`;
}

export function ProductCard({
  product,
  href = getProductDetailUrl(product.id),
  onAddToCart,
  onWishlistToggle,
  badgeSlot,
  loading,
  className,
}: ProductCardProps) {
  const displayPrice = product.salePrice ?? product.price;
  const hasDiscount =
    product.salePrice !== undefined && product.salePrice < product.price;

  return (
    <article
      className={cn(
        "group relative flex w-full max-w-[262px] flex-col bg-[var(--commerce-background-default)]",
        className,
      )}
    >
      <div className="relative aspect-[262/349] w-full overflow-hidden bg-[var(--commerce-background-light)]">
        {badgeSlot ? (
          <div className="pointer-events-none absolute top-4 left-4 z-20 flex flex-wrap gap-1">
            {badgeSlot}
          </div>
        ) : null}
        <button
          type="button"
          className="absolute top-4 right-4 z-20 flex size-8 items-center justify-center rounded-full bg-[var(--commerce-background-paper)] shadow-sm transition-opacity focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--commerce-semantic-info)]"
          aria-label={
            product.isLiked ? "위시리스트에서 제거" : "위시리스트에 추가"
          }
          aria-pressed={product.isLiked ?? false}
          onClick={() => onWishlistToggle?.()}
        >
          <HeartIcon filled={product.isLiked} />
        </button>
        <Link
          href={href}
          className="absolute inset-0 z-0 block outline-none focus-visible:ring-2 focus-visible:ring-[var(--commerce-semantic-info)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--commerce-background-light)]"
          aria-label={`${product.name} 상세 보기`}
        >
          {loading ? (
            <div
              className="size-full animate-pulse bg-[var(--commerce-neutral-n02-100)]"
              aria-hidden
            />
          ) : (
            <Image
              src={product.imageUrl}
              alt=""
              fill
              unoptimized={
                product.imageUrl.startsWith("http://") ||
                product.imageUrl.startsWith("https://")
              }
              className="object-cover transition-transform group-hover:scale-[1.02]"
              sizes="(max-width: 768px) 50vw, 262px"
            />
          )}
        </Link>
        {onAddToCart && !loading ? (
          <div className="absolute inset-x-4 bottom-4 z-10 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
            <Button
              type="button"
              variant="primary"
              size="md"
              className="w-full"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onAddToCart();
              }}
            >
              Add to cart
            </Button>
          </div>
        ) : null}
      </div>
      <div className="flex flex-col gap-1 pt-4">
        {product.rating !== undefined ? (
          <RatingStars value={product.rating} size="sm" />
        ) : null}
        <Link
          href={href}
          className="outline-none focus-visible:ring-2 focus-visible:ring-[var(--commerce-semantic-info)] focus-visible:ring-offset-2"
        >
          <h3
            className="line-clamp-2"
            style={{
              ...typographyToStyle(commerceTypography.body2Semi),
              color: commerceColors.text.primary,
            }}
          >
            {product.name}
          </h3>
        </Link>
        <div className="flex flex-wrap items-baseline gap-2">
          <span
            style={{
              ...typographyToStyle(commerceTypography.caption1Semi),
              color: commerceColors.text.primary,
            }}
          >
            {formatPrice(displayPrice)}
          </span>
          {hasDiscount ? (
            <span
              className="line-through"
              style={{
                ...typographyToStyle(commerceTypography.caption1),
                color: commerceColors.text.secondary,
              }}
            >
              {formatPrice(product.price)}
            </span>
          ) : null}
        </div>
        {product.reviewCount !== undefined ? (
          <span className="text-xs text-[var(--commerce-text-muted)]">
            리뷰 {product.reviewCount.toLocaleString("ko-KR")}개
          </span>
        ) : null}
      </div>
    </article>
  );
}

function HeartIcon({ filled }: { filled?: boolean }) {
  return (
    <svg
      width={18}
      height={18}
      viewBox="0 0 24 24"
      fill={filled ? commerceColors.primary.main : "none"}
      stroke={commerceColors.primary.main}
      strokeWidth={2}
      aria-hidden
    >
      <path d="M12 21s-7-4.35-7-10a5 5 0 0110 0 5 5 0 0110 0c0 5.65-7 10-7 10z" />
    </svg>
  );
}
