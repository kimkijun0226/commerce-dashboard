"use client";

// 장바구니 담기 버튼 하나에 optimistic 상태와 실제 저장 결과를 함께 묶어 둔 컴포넌트입니다.
import type { CartProduct, ProductStatus } from "@/commons/store/cart-store";
import { useCartStore } from "@/commons/store/cart-store";
import type { ProductDetail } from "@/commons/types/product";
import { cn } from "@/components/ui";
import type { CSSProperties } from "react";
import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";

// 상세 상품 데이터를 장바구니 스토어가 쓰는 최소 형태로 변환합니다.
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

export type AddToCartButtonProps = {
  product: ProductDetail;
  quantity: number;
  disabled?: boolean;
  className?: string;
  style?: CSSProperties;
};

// 클릭 직후 optimistic하게 상태를 바꾸고, 실패 시 다시 원상복구하는 담기 버튼입니다.
export function AddToCartButton({
  product,
  quantity,
  disabled = false,
  className,
  style,
}: AddToCartButtonProps) {
  const addItem = useCartStore((s) => s.addItem);
  const [isAdded, setIsAdded] = useState(false);
  const [isPending, startTransition] = useTransition();

  // 상품이 바뀌면 직전 상품의 "추가됨" 상태를 초기화합니다.
  useEffect(() => {
    setIsAdded(false);
  }, [product.id]);

  return (
    <button
      type="button"
      disabled={disabled || isPending}
      className={cn(className)}
      style={style}
      aria-label="장바구니에 담기"
      onClick={() => {
        if (disabled || isPending) return;
        const prev = isAdded;
        setIsAdded(true);

        startTransition(async () => {
          const ok = await addItem(toCartProduct(product), quantity);
          if (ok) {
            toast.success("장바구니에 담았습니다.");
            return;
          }
          setIsAdded(prev);
          toast.error("장바구니에 담지 못했습니다. 잠시 후 다시 시도해 주세요.");
        });
      }}
    >
      <span className="leading-[28px] tracking-[-0.4px]">
        {isPending ? "추가 중..." : isAdded ? "추가됨" : "Add to cart"}
      </span>
    </button>
  );
}
