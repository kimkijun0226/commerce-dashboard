"use client";

import type { ProductDetail } from "@/commons/types/product";
import { getProductDisplayName, formatWon } from "@/commons/utils/productDisplay";
import { useProductReviews } from "@/features/products/hooks/useProductReviews";
import { cn } from "@/components/ui";
import { FiStar } from "react-icons/fi";

export type ProductInfoSectionProps = { product: ProductDetail; className?: string };
export function ProductInfoSection({ product, className }: ProductInfoSectionProps) {
  const { reviewCount, displayRating, hasReviews, isPending } = useProductReviews(product.id, { fallbackRating: product.rating });
  const count = hasReviews ? reviewCount : product.reviewSummary?.count ?? 0;
  const price = product.salePrice ?? product.price;
  const info = product.additional_info;
  const brand = info && typeof info === "object" && !Array.isArray(info) && typeof info["브랜드"] === "string" ? info["브랜드"] : "";
  const fullName = getProductDisplayName(product.name);
  const name = brand && fullName.startsWith(`${brand} `) ? fullName.slice(brand.length + 1) : fullName;
  return (
    <section className={cn("flex min-w-0 flex-col", className)} aria-label="상품 정보">
      {brand ? <p className="mb-3 text-sm font-semibold text-[#858d94]">{brand}</p> : null}
      <h1 className="text-[26px] font-semibold leading-snug tracking-[-0.9px] text-[#141718] sm:text-[32px]">{name}</h1>
      <div className="mt-5 flex items-baseline gap-3">
        {price < product.price ? <span className="text-xl font-bold text-[#e05c42]">{Math.round((1 - price / product.price) * 100)}%</span> : null}
        <p className="text-[30px] font-bold tracking-[-1px]">{formatWon(price)}</p>
        {price < product.price ? <span className="text-sm text-[#9ba2a8] line-through">{formatWon(product.price)}</span> : null}
      </div>
      <div className="mt-4 flex items-center gap-2 text-sm text-[#858d94]">
        <FiStar className="size-4 fill-[#e9b35d] text-[#e9b35d]" aria-hidden />
        <span className="font-medium text-[#454d54]">{isPending ? "—" : displayRating.toFixed(1)}</span><span>· 리뷰 {count.toLocaleString("ko-KR")}개</span>
      </div>
      {product.description ? <p className="mt-7 whitespace-pre-line border-t border-[#e8ebed] pt-6 text-sm leading-7 text-[#727b83]">{product.description}</p> : null}
      <dl className="mt-7 grid grid-cols-[80px_1fr] gap-x-3 gap-y-3 rounded-xl bg-[#f7f8f9] p-4 text-xs leading-5">
        <dt className="text-[#8c959d]">배송 안내</dt><dd>50,000원 이상 무료 배송</dd>
        <dt className="text-[#8c959d]">사이즈 안내</dt><dd className="whitespace-pre-line text-[#626b73]">{product.measurements || "상품 상세 안내를 확인해 주세요."}</dd>
      </dl>
    </section>
  );
}
