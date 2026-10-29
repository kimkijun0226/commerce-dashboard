"use client";

import { cn } from "@/components/ui";
import Image from "next/image";
import { shouldBypassImageOptimization } from "@/commons/utils/imageOptimization";

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
        상세 이미지가 없습니다.
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
          className="relative m-0 aspect-square w-full max-w-lg overflow-hidden rounded-xl border border-[#e8ecef] bg-[#f3f5f7] shadow-sm"
        >
          <Image
            src={src}
            alt={`${imageAltBase} — detail image ${i + 1}`}
            fill
            sizes="(max-width: 640px) 100vw, 512px"
            unoptimized={shouldBypassImageOptimization(src)}
            className="object-contain object-center"
            loading="lazy"
            decoding="async"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </figure>
      ))}
    </div>
  );
}
