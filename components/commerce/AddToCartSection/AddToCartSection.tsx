"use client";

import { commerceColors } from "@/commons/constants/color";
import { commerceTypography } from "@/commons/constants/typography";
import { Button, cn, typographyToStyle } from "@/components/ui";
import { QuantitySelector } from "../QuantitySelector/QuantitySelector";
import { FaHeart, FaRegHeart } from "react-icons/fa";

export type AddToCartSectionProps = {
  quantity: number;
  onQuantityChange: (next: number) => void;
  onAddToCart?: () => void;
  onWishlistToggle?: () => void;
  /** PDP variant에서 위시리스트 하트 상태 */
  wishlisted?: boolean;
  disabled?: boolean;
  /** card: 카드형 박스 / pdp: 피그마 상세 1행 수량+위시리스트·2행 담기 */
  variant?: "card" | "pdp";
  className?: string;
};

export function AddToCartSection({
  quantity,
  onQuantityChange,
  onAddToCart,
  onWishlistToggle,
  wishlisted = false,
  disabled,
  variant = "card",
  className,
}: AddToCartSectionProps) {
  if (variant === "pdp") {
    return (
      <section
        className={cn("flex w-full flex-col gap-4", className)}
        aria-label="장바구니 담기"
      >
        <div className="flex w-full gap-3">
          <QuantitySelector
            className="w-[127px] shrink-0"
            value={quantity}
            onChange={onQuantityChange}
            disabled={disabled}
            variant="product"
          />
          {onWishlistToggle ? (
            <Button
              type="button"
              variant="ghost"
              size="lg"
              disabled={disabled}
              className="h-[52px] min-h-[52px] flex-1 rounded-lg border border-(--commerce-primary-main) bg-transparent hover:bg-(--commerce-background-paper)"
              style={{ color: commerceColors.text.primary }}
              leftIcon={
                wishlisted ? (
                  <FaHeart
                    className="text-[18px]"
                    style={{ color: commerceColors.primary.main }}
                    aria-hidden
                  />
                ) : (
                  <FaRegHeart
                    className="text-[18px]"
                    style={{ color: commerceColors.primary.main }}
                    aria-hidden
                  />
                )
              }
              aria-label={
                wishlisted ? "위시리스트에서 제거" : "위시리스트에 추가"
              }
              aria-pressed={wishlisted}
              onClick={onWishlistToggle}
            >
              Wishlist
            </Button>
          ) : null}
        </div>
        <Button
          type="button"
          size="lg"
          disabled={disabled}
          className="h-[52px] min-h-[52px] w-full rounded-lg"
          onClick={onAddToCart}
          aria-label="장바구니에 담기"
        >
          Add to cart
        </Button>
      </section>
    );
  }

  return (
    <section
      className={cn(
        "flex flex-col gap-3 rounded-2xl border p-4",
        className,
      )}
      style={{
        backgroundColor: commerceColors.background.paper,
        borderColor: commerceColors.border.subtle,
      }}
      aria-label="장바구니 담기"
    >
      <div className="flex items-center justify-between gap-3">
        <span
          style={{
            ...typographyToStyle(commerceTypography.caption2Semi),
            color: commerceColors.text.secondary,
          }}
        >
          수량
        </span>
        <QuantitySelector
          value={quantity}
          onChange={onQuantityChange}
          disabled={disabled}
          variant="product"
        />
      </div>

      <div className="flex flex-col gap-2">
        <Button
          type="button"
          size="lg"
          disabled={disabled}
          onClick={onAddToCart}
          aria-label="장바구니에 담기"
        >
          장바구니 담기
        </Button>
        {onWishlistToggle ? (
          <Button
            type="button"
            variant="secondary"
            size="lg"
            disabled={disabled}
            onClick={onWishlistToggle}
            aria-label="위시리스트"
          >
            위시리스트
          </Button>
        ) : null}
      </div>
    </section>
  );
}

