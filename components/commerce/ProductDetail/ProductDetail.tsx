import type { ProductDetailData } from "@/features/products/api/useProductDetail";
import Image from "next/image";

function formatPrice(n: number, currency = "₩") {
  return `${currency}${n.toLocaleString("ko-KR")}`;
}

export type ProductDetailProps = {
  product: ProductDetailData;
};

export function ProductDetail({ product }: ProductDetailProps) {
  const displayPrice = product.salePrice ?? product.price;
  const hasDiscount =
    product.salePrice !== null && product.salePrice < product.price;

  return (
    <div className="mx-auto max-w-[960px] px-4 py-10 sm:px-8">
      <div className="grid gap-10 md:grid-cols-2 md:gap-12">
        <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-(--commerce-background-light)">
          {product.imageUrl ? (
            <Image
              src={product.imageUrl}
              alt=""
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 480px"
              unoptimized={
                product.imageUrl.startsWith("http://") ||
                product.imageUrl.startsWith("https://")
              }
              priority
            />
          ) : (
            <div className="flex size-full items-center justify-center text-(--commerce-text-secondary)">
              이미지 없음
            </div>
          )}
        </div>

        <div className="flex flex-col gap-4">
          <h1
            className="text-[28px] font-medium leading-8 text-(--commerce-text-primary)"
            style={{ fontFamily: "var(--commerce-font-heading)" }}
          >
            {product.name}
          </h1>

          {product.rating !== null ? (
            <p className="text-sm text-(--commerce-text-secondary)">
              평점 {product.rating.toFixed(1)}
            </p>
          ) : null}

          <div className="flex flex-wrap items-baseline gap-2">
            <span className="text-xl font-semibold text-(--commerce-text-primary)">
              {formatPrice(displayPrice)}
            </span>
            {hasDiscount ? (
              <span className="text-base line-through text-(--commerce-text-secondary)">
                {formatPrice(product.price)}
              </span>
            ) : null}
          </div>

          <p className="text-xs uppercase tracking-wide text-(--commerce-text-muted)">
            상태: {product.status}
          </p>

          {product.description ? (
            <div className="mt-2 border-t border-(--commerce-border-subtle) pt-6">
              <h2 className="mb-2 text-sm font-semibold text-(--commerce-text-primary)">
                상품 설명
              </h2>
              <p className="whitespace-pre-wrap text-sm leading-6 text-(--commerce-text-secondary)">
                {product.description}
              </p>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
