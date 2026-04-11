"use client";

import { commerceColors } from "@/commons/constants/color";
import { commerceTypography } from "@/commons/constants/typography";
import type { CartProduct, ProductStatus } from "@/commons/store/cart-store";
import { useCartStore } from "@/commons/store/cart-store";
import type { ProductDetail } from "@/commons/types/product";
import { QuantitySelector } from "@/components/commerce/QuantitySelector/QuantitySelector";
import { cn, typographyToStyle } from "@/components/ui";
import type { CSSProperties } from "react";
import { useCallback, useState } from "react";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import { toast } from "sonner";

/**
 * Figma(노드 37-1912 등 PDP 루프) 구매 블록
 * - 수량: 고정 127×52, r8, fill #f5f5f5 (QuantitySelector compact)
 * - 위시리스트: 로컬 UI만 — 선택 시 하트 빨간 채움(미저장)
 * - 장바구니: 컨테이너 전폭(최대 508)×52, fill #141718
 */
const WISHLIST_ACTIVE_COLOR = commerceColors.semantic.danger;

const PDP_CTA_TYPO: CSSProperties = {
  ...typographyToStyle(commerceTypography.buttonM),
  fontFamily: "var(--commerce-font-body)",
};

const FOCUS_OUTLINE_LIGHT =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--commerce-semantic-info)]";

const FOCUS_OUTLINE_ON_DARK =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/90";

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

export type AddToCartSectionProps = {
  product: ProductDetail;
  className?: string;
};

export function AddToCartSection({ product, className }: AddToCartSectionProps) {
  const addItem = useCartStore((s) => s.addItem);
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);

  const cartDisabled =
    product.status === "hidden" || product.status === "sold_out";

  const handleAddToCart = useCallback(() => {
    if (cartDisabled) return;
    const ok = addItem(toCartProduct(product), quantity);
    if (ok) {
      toast.success("장바구니에 담았습니다.");
    } else {
      toast.error("장바구니에 담지 못했습니다. 잠시 후 다시 시도해 주세요.");
    }
  }, [addItem, cartDisabled, product, quantity]);

  const handleWishlistToggle = useCallback(() => {
    if (cartDisabled) return;
    setIsWishlisted((v) => !v);
  }, [cartDisabled]);

  return (
    <section
      className={cn(
        "w-full min-w-0 max-w-[508px] border-t border-(--commerce-border-subtle) pt-8",
        className,
      )}
      aria-label="장바구니 담기"
    >
      <div
        className={cn(
          "flex w-full min-w-0 flex-col gap-4",
          "sm:h-[52px] sm:flex-row sm:items-stretch sm:gap-6",
        )}
      >
        <QuantitySelector
          productLayout="compact"
          className="box-border w-[127px] max-w-[127px] shrink-0"
          value={quantity}
          min={1}
          onChange={setQuantity}
          disabled={cartDisabled}
          variant="product"
        />

        <button
          type="button"
          disabled={cartDisabled}
          className={cn(
            "box-border flex h-[52px] min-h-[52px] w-full min-w-0 flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg",
            "border border-solid border-(--commerce-primary-main) bg-transparent antialiased",
            "text-(--commerce-text-primary) transition-[background-color,box-shadow,opacity,transform] duration-200 ease-in-out",
            "hover:bg-(--commerce-background-light) hover:shadow-[inset_0_0_0_1px_rgba(20,23,24,0.04),0_1px_2px_rgba(20,23,24,0.06)]",
            "active:scale-[0.995] active:bg-(--commerce-background-elevated) active:shadow-none",
            "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
            FOCUS_OUTLINE_LIGHT,
          )}
          style={PDP_CTA_TYPO}
          aria-label={
            isWishlisted ? "위시리스트 해제(표시만)" : "위시리스트 표시(저장 안 함)"
          }
          aria-pressed={isWishlisted}
          onClick={handleWishlistToggle}
        >
          {isWishlisted ? (
            <FaHeart
              className="size-5 shrink-0"
              style={{ color: WISHLIST_ACTIVE_COLOR }}
              aria-hidden
            />
          ) : (
            <FaRegHeart
              className="size-5 shrink-0"
              style={{ color: commerceColors.primary.main }}
              aria-hidden
            />
          )}
          <span
            className={cn(
              "min-w-0 truncate text-center leading-[28px]",
              isWishlisted && "text-(--commerce-semantic-danger)",
            )}
          >
            Wishlist
          </span>
        </button>
      </div>

      <button
        type="button"
        disabled={cartDisabled}
        className={cn(
          "mt-4 box-border flex h-[52px] min-h-[52px] w-full min-w-0 max-w-[508px] cursor-pointer items-center justify-center rounded-lg border-0 antialiased",
          "bg-(--commerce-primary-main) text-(--commerce-text-inverse)",
          "transition-[background-color,box-shadow,filter,transform] duration-200 ease-in-out",
          "hover:bg-(--commerce-primary-light) hover:shadow-[0_10px_28px_rgba(20,23,24,0.16),0_2px_6px_rgba(20,23,24,0.08)]",
          "active:translate-y-px active:shadow-[0_4px_14px_rgba(20,23,24,0.14)] active:brightness-[0.96]",
          "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none",
          FOCUS_OUTLINE_ON_DARK,
        )}
        style={PDP_CTA_TYPO}
        aria-label="장바구니에 담기"
        onClick={handleAddToCart}
      >
        <span className="leading-[28px] tracking-[-0.4px]">Add to cart</span>
      </button>
    </section>
  );
}
