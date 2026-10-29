"use client";

import { shouldBypassImageOptimization } from "@/commons/utils/imageOptimization";
import { getProductDetailUrl } from "@/commons/constants/url";
import { getProductDisplayName, formatWon } from "@/commons/utils/productDisplay";
import { animateToCart, captureCartImage, type CartAnimationSource } from "@/commons/utils/cartAnimation";
import type { Product } from "@/components/commerce/types";
import { cn } from "@/components/ui";
import { CardLikeButton } from "@/components/commerce/likes/CardLikeButton";
import { ProductOptionsDialog } from "@/components/commerce/ProductOptionsDialog";
import Image from "next/image";
import Link from "next/link";
import { useRef, useState, type ReactNode } from "react";
import { FiShoppingCart, FiStar } from "react-icons/fi";
import { FaHeart, FaRegHeart } from "react-icons/fa";

export type ProductCardProps = {
  product: Product;
  href?: string;
  onAddToCart?: (selectedOptions?: Record<string, string>) => boolean | void | Promise<boolean | void>;
  onWishlistToggle?: () => void;
  badgeSlot?: ReactNode;
  loading?: boolean;
  className?: string;
};

export function ProductCard({ product, href = getProductDetailUrl(product.id), onAddToCart, onWishlistToggle, badgeSlot, loading, className }: ProductCardProps) {
  const imageRef = useRef<HTMLDivElement>(null);
  const [pending, setPending] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const fullName = getProductDisplayName(product.name);
  const name = product.brand && fullName.startsWith(`${product.brand} `) ? fullName.slice(product.brand.length + 1) : fullName;
  const displayPrice = product.salePrice ?? product.price;
  const hasDiscount = displayPrice < product.price;
  const count = product.reviewCount ?? product.reviewSummary?.count;

  async function add(selectedOptions: Record<string, string> = {}, source: CartAnimationSource | null = captureCartImage(imageRef.current)) {
    if (!onAddToCart || pending) return;
    setPending(true);
    try {
      const success = await onAddToCart(selectedOptions);
      if (success === false) return;
      setShowOptions(false);
      await animateToCart(source);
    } finally {
      setPending(false);
    }
  }

  return (
    <article className={cn("group relative flex min-w-0 w-full flex-col", className)}>
      <div ref={imageRef} className="relative aspect-[4/5] w-full overflow-hidden rounded-xl bg-[#f3f4f5]">
        {badgeSlot ? <div className="pointer-events-none absolute left-3 top-3 z-20">{badgeSlot}</div> : null}
        <Link href={href} className="absolute inset-0 z-0 block outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-black" aria-label={`${name} 상세 보기`}>
          {loading ? <div className="size-full animate-pulse bg-gray-100" /> : (
            <Image src={product.imageUrl} alt="" fill unoptimized={shouldBypassImageOptimization(product.imageUrl)}
              className="object-cover transition-transform duration-500 motion-safe:group-hover:scale-[1.035]"
              sizes="(max-width: 479px) 50vw, (max-width: 767px) 33vw, (max-width: 1023px) 25vw, (max-width: 1535px) 20vw, 280px" />
          )}
        </Link>
        <div className="absolute right-2 top-2 z-20 flex items-center gap-1.5 sm:right-3 sm:top-3">
          {onWishlistToggle ? (
            <button type="button" onClick={onWishlistToggle} aria-label={product.isLiked ? "위시리스트에서 제거" : "위시리스트에 추가"} aria-pressed={product.isLiked ?? false}
              className="flex size-8 items-center justify-center rounded-full bg-white/90 shadow-sm backdrop-blur-sm focus-visible:outline-2">
              {product.isLiked ? <FaHeart className="size-4 text-rose-500" /> : <FaRegHeart className="size-4" />}
            </button>
          ) : <CardLikeButton productId={product.id} initialLiked={product.isLiked ?? false} syncOnMount={false} className="!bg-white/90 !backdrop-blur-sm" />}
          {onAddToCart && !loading ? (
            <button type="button" disabled={pending} aria-busy={pending} aria-label={`${name} 장바구니에 담기`}
              onClick={() => { if (product.options?.length) setShowOptions(true); else void add(); }}
              className="flex size-8 items-center justify-center rounded-full bg-white/90 shadow-sm backdrop-blur-sm transition-colors hover:bg-[#141718] hover:text-white focus-visible:outline-2 disabled:opacity-50">
              <FiShoppingCart className="size-4" aria-hidden />
            </button>
          ) : null}
        </div>
      </div>
      <div className="flex flex-col pt-3">
        {product.brand ? <p className="mb-1 text-[11px] font-semibold tracking-wide text-[#737b82] sm:text-xs">{product.brand}</p> : null}
        <Link href={href} className="rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-black">
          <h3 className="line-clamp-2 min-h-10 text-[13px] font-medium leading-5 tracking-[-0.2px] text-[#252a2e] sm:text-sm">{name}</h3>
        </Link>
        <div className="mt-2 flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
          {hasDiscount ? <span className="text-sm font-bold text-[#e05c42]">{Math.round((1 - displayPrice / product.price) * 100)}%</span> : null}
          <span className="text-[15px] font-bold tracking-[-0.4px] text-[#141718] sm:text-lg">{formatWon(displayPrice)}</span>
          {hasDiscount ? <span className="text-xs text-[#9aa1a7] line-through">{formatWon(product.price)}</span> : null}
        </div>
        {product.rating !== undefined ? (
          <div className="mt-2 flex flex-wrap items-center gap-1 text-[11px] text-[#8a9298] sm:text-xs">
            <FiStar className="size-3 fill-[#e9b35d] text-[#e9b35d]" aria-hidden />
            <span aria-label={`평균 ${product.rating.toFixed(1)}점`} className="font-medium text-[#646c73]">{product.rating.toFixed(1)}</span>
            {count !== undefined ? <span>· 리뷰 {count.toLocaleString("ko-KR")}</span> : null}
          </div>
        ) : null}
      </div>
      {showOptions ? <ProductOptionsDialog product={product} options={product.options ?? []} pending={pending} onClose={() => setShowOptions(false)} onConfirm={add} /> : null}
    </article>
  );
}
