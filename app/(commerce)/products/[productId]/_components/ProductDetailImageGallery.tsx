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
    <div className={cn("flex w-full max-w-none flex-col gap-4 sm:gap-6", className)}>
      {urls.map((src, i) => (
        <figure key={`${src}-${i}`} className="m-0 overflow-hidden rounded-xl border border-[#e8ecef] bg-[#fafbfb] shadow-sm">
          <img
            src={src}
            alt={`${imageAltBase} — detail ${i + 1}`}
            className="h-auto w-full object-cover object-top"
            loading={i === 0 ? "eager" : "lazy"}
            decoding="async"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </figure>
      ))}
    </div>
  );
}
