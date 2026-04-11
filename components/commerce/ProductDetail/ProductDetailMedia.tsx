import Image from "next/image";

export type ProductDetailMediaProps = {
  imageUrl: string | null;
  alt: string;
};

export function ProductDetailMedia({ imageUrl, alt }: ProductDetailMediaProps) {
  return (
    <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-(--commerce-background-light)">
      {imageUrl ? (
        <Image
          src={imageUrl}
          alt={alt}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 480px"
          unoptimized={
            imageUrl.startsWith("http://") || imageUrl.startsWith("https://")
          }
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
