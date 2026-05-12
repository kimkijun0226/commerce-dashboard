"use client";

import { getProductDetailUrl } from "@/commons/constants/url";
import { commerceColors } from "@/commons/constants/color";
import { commerceTypography } from "@/commons/constants/typography";
import type { Product } from "@/components/commerce/types";
import { Button, cn, typographyToStyle } from "@/components/ui";
import { RatingStars } from "../RatingStars/RatingStars";
import { CardLikeButton } from "@/components/commerce/likes/CardLikeButton";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { FaHeart, FaRegHeart } from "react-icons/fa";

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
        {onWishlistToggle ? (
          <button
            type="button"
            className={cn(
              "absolute top-4 right-4 z-20 flex size-8 items-center justify-center rounded-full",
              "overflow-visible",
              "border border-white/40 bg-white/55 shadow-sm backdrop-blur-md",
              "transition-all hover:bg-white/70 hover:shadow-md",
              "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--commerce-semantic-info)",
            )}
            aria-label={
              product.isLiked ? "위시리스트에서 제거" : "위시리스트에 추가"
            }
            aria-pressed={product.isLiked ?? false}
            onClick={() => onWishlistToggle?.()}
          >
            {product.isLiked ? (
              <FaHeart
                className="text-[18px] leading-none"
                style={{ color: commerceColors.primary.main }}
                aria-hidden
              />
            ) : (
              <FaRegHeart
                className="text-[18px] leading-none"
                style={{ color: commerceColors.primary.main }}
                aria-hidden
              />
            )}
          </button>
        ) : (
          <CardLikeButton
            productId={product.id}
            initialLiked={product.isLiked ?? false}
            syncOnMount={false}
            className="absolute top-4 right-4 z-20"
          />
        )}
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
          <div className="flex flex-wrap items-center gap-1.5">
            <RatingStars value={product.rating} size="sm" />
            <span
              className="text-xs font-medium tabular-nums text-[var(--commerce-text-secondary)]"
              aria-label={`평균 ${product.rating.toFixed(1)}점`}
            >
              {product.rating.toFixed(1)}
            </span>
          </div>
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
        {product.reviewCount !== undefined && product.reviewCount > 0 ? (
          <span className="text-xs text-[var(--commerce-text-muted)]">
            리뷰 {product.reviewCount.toLocaleString("ko-KR")}개
          </span>
        ) : null}
        {product.reviewSummary?.highlight ? (
          <span
            className="line-clamp-2 text-xs leading-4 text-[var(--commerce-text-muted)]"
            title={product.reviewSummary.highlight}
          >
            “{product.reviewSummary.highlight}”
          </span>
        ) : null}
      </div>
    </article>
  );
}
