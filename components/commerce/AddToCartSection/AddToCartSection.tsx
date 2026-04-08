"use client";

import { commerceColors } from "@/commons/constants/color";
import { commerceTypography } from "@/commons/constants/typography";
import { Button, cn, typographyToStyle } from "@/components/ui";
import { QuantitySelector } from "../QuantitySelector/QuantitySelector";

export type AddToCartSectionProps = {
  quantity: number;
  onQuantityChange: (next: number) => void;
  onAddToCart?: () => void;
  onWishlistToggle?: () => void;
  disabled?: boolean;
  className?: string;
};

export function AddToCartSection({
  quantity,
  onQuantityChange,
  onAddToCart,
  onWishlistToggle,
  disabled,
  className,
}: AddToCartSectionProps) {
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

