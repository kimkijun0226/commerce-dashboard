"use client";

import { cn } from "@/components/ui";

export type ProductDetailImageGalleryProps = {
  imageUrls: string[];
  imageAltBase: string;
  className?: string;
};

export function ProductDetailImageGallery({
  imageUrls,
  imageAltBase,
  className,
}: ProductDetailImageGalleryProps) {
  const urls = imageUrls.filter((u) => u.trim().length > 0);

  if (urls.length === 0) {
    return (
      <p
        className={cn("text-base leading-7 text-[#6c7275]", className)}
        style={{ fontFamily: "var(--commerce-font-body)" }}
      >
        등록된 상품 상세 이미지가 없습니다.
      </p>
    );
  }

  return (
    <div
      className={cn(
        "flex w-full max-w-none flex-col items-center gap-6 sm:gap-8",
        className,
      )}
    >
      {urls.map((src, i) => (
        <figure
          key={`${src}-${i}`}
          className="m-0 w-full max-w-lg overflow-hidden rounded-xl border border-[#e8ecef] bg-[#f3f5f7] shadow-sm"
        >
          <img
            src={src}
            alt={`${imageAltBase} — 세로 상세 ${i + 1}`}
            className="mx-auto block h-auto max-h-[min(92vh,1040px)] w-full object-contain object-center"
            loading={i === 0 ? "eager" : "lazy"}
            decoding="async"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </figure>
      ))}
    </div>
  );
}
