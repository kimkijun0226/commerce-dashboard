"use client";

import { commerceColors } from "@/commons/constants/color";
import { commerceTypography } from "@/commons/constants/typography";
import { Button, cn, typographyToStyle } from "@/components/ui";
import { QuantitySelector } from "../QuantitySelector/QuantitySelector";
import type { CSSProperties } from "react";
import { FaHeart, FaRegHeart } from "react-icons/fa";

/** Figma: PDP CTA Inter Medium 18/28, letterSpacing -0.4 */
const pdpCtaTypography: CSSProperties = {
  ...typographyToStyle(commerceTypography.buttonM),
  fontFamily: "var(--commerce-font-body)",
};

const pdpFocusVisible =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--commerce-semantic-info)]";

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
        className={cn(
          "flex w-full flex-col gap-4 border-t border-(--commerce-border-subtle) pt-8",
          className,
        )}
        aria-label="장바구니 담기"
      >
        <div className="flex w-full items-stretch gap-4">
          <QuantitySelector
            productLayout="compact"
            value={quantity}
            onChange={onQuantityChange}
            disabled={disabled}
            variant="product"
          />
          {onWishlistToggle ? (
            <button
              type="button"
              disabled={disabled}
              className={cn(
                "inline-flex h-[52px] min-h-[52px] min-w-0 flex-1 items-center justify-center gap-2 rounded-lg bg-transparent",
                "border border-solid border-(--commerce-primary-main)",
                "text-(--commerce-text-primary) transition-[background-color,box-shadow,transform,color] duration-200 ease-out",
                "hover:bg-(--commerce-background-light) hover:shadow-[0_1px_0_rgba(20,23,24,0.06)]",
                "active:scale-[0.99] active:bg-(--commerce-background-elevated)",
                "disabled:pointer-events-none disabled:opacity-45",
                pdpFocusVisible,
              )}
              style={pdpCtaTypography}
              aria-label={
                wishlisted ? "위시리스트에서 제거" : "위시리스트에 추가"
              }
              aria-pressed={wishlisted}
              onClick={onWishlistToggle}
            >
              {wishlisted ? (
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
          ) : null}
        </div>
        <button
          type="button"
          disabled={disabled}
          className={cn(
            "h-[52px] min-h-[52px] w-full rounded-lg border-0",
            "bg-(--commerce-primary-main) text-(--commerce-text-inverse)",
            "transition-[background-color,box-shadow,filter,transform] duration-200 ease-out",
            "hover:bg-(--commerce-primary-light) hover:shadow-[0_12px_32px_rgba(20,23,24,0.18)]",
            "active:translate-y-px active:shadow-[0_6px_16px_rgba(20,23,24,0.14)] active:brightness-[0.97]",
            "disabled:pointer-events-none disabled:opacity-45 disabled:shadow-none",
            pdpFocusVisible,
          )}
          style={pdpCtaTypography}
          onClick={onAddToCart}
          aria-label="장바구니에 담기"
        >
          Add to cart
        </button>
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

