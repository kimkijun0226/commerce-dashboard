"use client";

import { toggleLikeItem } from "@/app/actions/wishlist";
import { commerceColors } from "@/commons/constants/color";
import { commerceTypography } from "@/commons/constants/typography";
import { isAuthRequiredError } from "@/commons/errors/auth-required-error";
import type { CartProduct, ProductStatus } from "@/commons/store/cart-store";
import { useCartStore } from "@/commons/store/cart-store";
import type { ProductDetail } from "@/commons/types/product";
import { QuantitySelector } from "@/components/commerce/QuantitySelector/QuantitySelector";
import { cn, typographyToStyle } from "@/components/ui";
import { useRouter } from "next/navigation";
import type { CSSProperties } from "react";
import { useCallback, useEffect, useState } from "react";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import { toast } from "sonner";

const PDP_CTA_TYPO: CSSProperties = {
  ...typographyToStyle(commerceTypography.buttonM),
  fontFamily: "var(--commerce-font-body)",
};

const FOCUS_VISIBLE =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--commerce-semantic-info)]";

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
  initialIsLiked?: boolean;
  className?: string;
};

export function AddToCartSection({
  product,
  initialIsLiked = false,
  className,
}: AddToCartSectionProps) {
  const router = useRouter();
  const addItem = useCartStore((s) => s.addItem);
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(initialIsLiked);
  const [isPending, setIsPending] = useState(false);

  useEffect(() => {
    setQuantity(1);
  }, [product.id]);

  useEffect(() => {
    setIsWishlisted(initialIsLiked);
  }, [initialIsLiked, product.id]);

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

  const handleWishlistToggle = useCallback(async () => {
    if (cartDisabled || isPending) return;
    const rollback = isWishlisted;
    setIsWishlisted(!rollback);
    setIsPending(true);
    try {
      const { liked } = await toggleLikeItem(product.id);
      setIsWishlisted(liked);
    } catch (e) {
      setIsWishlisted(rollback);
      if (isAuthRequiredError(e)) {
        router.push("/login");
        return;
      }
      toast.error("위시리스트를 업데이트할 수 없습니다.");
    } finally {
      setIsPending(false);
    }
  }, [cartDisabled, isPending, isWishlisted, product.id, router]);

  return (
    <section
      className={cn(
        "w-full max-w-[508px] border-t border-(--commerce-border-subtle) pt-8",
        className,
      )}
      aria-label="장바구니 담기"
    >
      <div className="flex w-full flex-col gap-4 sm:h-[52px] sm:flex-row sm:items-stretch sm:gap-6">
        <QuantitySelector
          productLayout="compact"
          className="h-[52px] w-full max-w-[127px] shrink-0 sm:w-[127px]"
          value={quantity}
          min={1}
          onChange={setQuantity}
          disabled={cartDisabled}
          variant="product"
        />

        <button
          type="button"
          disabled={cartDisabled || isPending}
          className={cn(
            "inline-flex h-[52px] w-full shrink-0 items-center justify-center gap-2 rounded-lg border border-solid border-(--commerce-primary-main) bg-transparent sm:w-[357px]",
            "text-(--commerce-text-primary) transition-[background-color,box-shadow,opacity,transform] duration-200 ease-out",
            "hover:bg-(--commerce-background-light) hover:shadow-[0_1px_0_rgba(20,23,24,0.06)]",
            "active:scale-[0.99] active:bg-(--commerce-background-elevated)",
            "disabled:pointer-events-none disabled:opacity-45",
            FOCUS_VISIBLE,
          )}
          style={PDP_CTA_TYPO}
          aria-busy={isPending}
          aria-label={
            isWishlisted ? "위시리스트에서 제거" : "위시리스트에 추가"
          }
          aria-pressed={isWishlisted}
          onClick={() => void handleWishlistToggle()}
        >
          {isWishlisted ? (
            <FaHeart
              className="size-5 shrink-0"
              style={{ color: commerceColors.primary.main }}
              aria-hidden
            />
          ) : (
            <FaRegHeart
              className="size-5 shrink-0"
              style={{ color: commerceColors.primary.main }}
              aria-hidden
            />
          )}
          <span className="truncate">Wishlist</span>
        </button>
      </div>

      <button
        type="button"
        disabled={cartDisabled}
        className={cn(
          "mt-4 h-[52px] w-full max-w-[508px] rounded-lg border-0",
          "bg-(--commerce-primary-main) text-(--commerce-text-inverse)",
          "transition-[background-color,box-shadow,filter,transform] duration-200 ease-out",
          "hover:bg-(--commerce-primary-light) hover:shadow-[0_12px_32px_rgba(20,23,24,0.18)]",
          "active:translate-y-px active:shadow-[0_6px_16px_rgba(20,23,24,0.14)] active:brightness-[0.97]",
          "disabled:pointer-events-none disabled:opacity-45 disabled:shadow-none",
          FOCUS_VISIBLE,
        )}
        style={PDP_CTA_TYPO}
        aria-label="장바구니에 담기"
        onClick={handleAddToCart}
      >
        Add to cart
      </button>
    </section>
  );
}
