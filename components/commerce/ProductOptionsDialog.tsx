"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { FiX } from "react-icons/fi";
import type { Product } from "@/components/commerce/types";
import type { ProductOption } from "@/commons/utils/productOptions";
import { captureCartImage, type CartAnimationSource } from "@/commons/utils/cartAnimation";
import { getProductDisplayName, formatWon } from "@/commons/utils/productDisplay";
import { shouldBypassImageOptimization } from "@/commons/utils/imageOptimization";

export function ProductOptionsDialog({ product, options, pending, onClose, onConfirm }: {
  product: Pick<Product, "name" | "imageUrl" | "price" | "salePrice">;
  options: ProductOption[];
  pending: boolean;
  onClose: () => void;
  onConfirm: (selected: Record<string, string>, source: CartAnimationSource | null) => Promise<void>;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const [selected, setSelected] = useState<Record<string, string>>({});
  const complete = options.every((option) => option.required === false || selected[option.name]);
  useEffect(() => {
    const dialog = dialogRef.current;
    dialog?.showModal();
    return () => dialog?.close();
  }, []);

  return (
    <dialog ref={dialogRef} aria-labelledby="product-options-title"
      className="fixed inset-0 m-auto w-[calc(100%_-_32px)] max-w-md rounded-3xl border-0 bg-white p-0 text-[#141718] shadow-2xl backdrop:bg-black/40 backdrop:backdrop-blur-sm"
      onCancel={(event) => { event.preventDefault(); if (!pending) onClose(); }}
      onClick={(event) => { if (event.target === event.currentTarget && !pending) onClose(); }}>
      <section className="max-h-[85dvh] overflow-y-auto p-6" onClick={(event) => event.stopPropagation()}>
        <div className="mb-6 flex items-center justify-between">
          <h2 id="product-options-title" className="text-xl font-semibold">옵션을 선택해 주세요</h2>
          <button type="button" onClick={onClose} disabled={pending} aria-label="옵션 선택 닫기" className="flex size-9 items-center justify-center rounded-full hover:bg-gray-100 focus-visible:outline-2"><FiX className="size-5" /></button>
        </div>
        <div className="mb-6 flex items-center gap-4 border-b border-gray-100 pb-6">
          <div ref={imageRef} className="relative size-24 shrink-0 overflow-hidden rounded-xl bg-gray-50">
            <Image src={product.imageUrl} alt="" fill sizes="96px" className="object-cover" unoptimized={shouldBypassImageOptimization(product.imageUrl)} />
          </div>
          <div><p className="text-sm font-medium leading-6">{getProductDisplayName(product.name)}</p><p className="mt-2 text-lg font-bold">{formatWon(product.salePrice ?? product.price)}</p></div>
        </div>
        <form onSubmit={(event) => { event.preventDefault(); if (complete && !pending) void onConfirm(selected, captureCartImage(imageRef.current)); }}>
          <div className="space-y-5">
            {options.map((option, index) => (
              <label key={option.name} className="block text-sm font-medium">
                {option.name} <span className="text-xs font-normal text-gray-400">{option.required === false ? "선택" : "필수"}</span>
                <select autoFocus={index === 0} required={option.required !== false} value={selected[option.name] ?? ""} disabled={pending}
                  onChange={(event) => setSelected((prev) => {
                    const next = { ...prev }; if (event.target.value) next[option.name] = event.target.value; else delete next[option.name]; return next;
                  })}
                  className="mt-2 block min-h-12 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm outline-none focus:border-gray-500 focus:ring-2 focus:ring-gray-100">
                  <option value="">{option.name} 선택</option>
                  {option.values.map((value) => <option key={value} value={value}>{value}</option>)}
                </select>
              </label>
            ))}
          </div>
          <button type="submit" disabled={!complete || pending} className="mt-7 min-h-12 w-full rounded-xl bg-[#141718] text-sm font-semibold text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-35">
            {pending ? "장바구니에 담는 중…" : "선택한 옵션으로 담기"}
          </button>
        </form>
      </section>
    </dialog>
  );
}
