"use client";

import { useCartStore, type CartProduct } from "@/commons/store/cart-store";
import type { ProductDetail } from "@/commons/types/product";
import { getProductDisplayName } from "@/commons/utils/productDisplay";
import { animateToCart, captureCartImage, type CartAnimationSource } from "@/commons/utils/cartAnimation";
import { ProductOptionsDialog } from "@/components/commerce/ProductOptionsDialog";
import { cn } from "@/components/ui";
import { useState, type CSSProperties } from "react";
import { FiShoppingCart } from "react-icons/fi";
import { toast } from "sonner";

export type AddToCartButtonProps = {
  product: ProductDetail;
  quantity: number;
  disabled?: boolean;
  className?: string;
  style?: CSSProperties;
};

export function AddToCartButton({ product, quantity, disabled = false, className, style }: AddToCartButtonProps) {
  const addItem = useCartStore((s) => s.addItem);
  const [pending, setPending] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  async function add(selectedOptions: Record<string, string> = {}, source: CartAnimationSource | null = captureCartImage(document.querySelector<HTMLElement>("[data-product-media]"))) {
    if (pending || disabled) return;
    setPending(true);
    try {
      const item: CartProduct = {
        id: product.id, name: getProductDisplayName(product.name), price: product.price,
        salePrice: product.salePrice ?? null, imageUrl: product.image_url,
        status: product.status === "registered" ? "visible" : product.status,
        selectedOptions,
      };
      const ok = await addItem(item, quantity);
      if (!ok) { toast.error("장바구니에 담지 못했습니다. 다시 시도해 주세요."); return; }
      setShowOptions(false);
      toast.success("장바구니에 담았습니다.");
      await animateToCart(source);
    } finally { setPending(false); }
  }
  return <>
    <button type="button" disabled={disabled || pending} className={cn("gap-2", className)} style={style}
      aria-label="장바구니에 담기" aria-busy={pending} onClick={() => { if (product.options?.length) setShowOptions(true); else void add(); }}>
      <FiShoppingCart className="size-5" aria-hidden /><span>{pending ? "담는 중…" : "장바구니 담기"}</span>
    </button>
    {showOptions ? <ProductOptionsDialog product={{ name: product.name, imageUrl: product.image_url ?? "", price: product.price, salePrice: product.salePrice }} options={product.options ?? []} pending={pending} onClose={() => setShowOptions(false)} onConfirm={add} /> : null}
  </>;
}
