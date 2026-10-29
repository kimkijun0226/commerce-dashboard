import { DETAIL_IMAGE_SIZES } from "@/commons/utils/productImage";
import { shouldBypassImageOptimization } from "@/commons/utils/imageOptimization";
import Image from "next/image";

export type ProductDetailMediaProps = {
  imageUrl: string | null;
  alt: string;
};

export function ProductDetailMedia({ imageUrl, alt }: ProductDetailMediaProps) {
  return (
    <div data-product-media className="relative aspect-square w-full self-start overflow-hidden rounded-2xl bg-(--commerce-background-light)">
      {imageUrl ? (
        <Image
          src={imageUrl}
          alt={alt}
          fill
          className="object-cover"
          sizes={DETAIL_IMAGE_SIZES}
          unoptimized={shouldBypassImageOptimization(imageUrl)}
          priority
        />
      ) : (
        <div className="flex size-full items-center justify-center text-(--commerce-text-secondary)">
          이미지 없음
        </div>
      )}
    </div>
  );
}
