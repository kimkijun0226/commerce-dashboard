"use client";

import { usePathname } from "next/navigation";
import { CatalogPageSkeleton } from "@/components/commerce/catalog/CatalogPageSkeleton";
import { ProductDetailPageSkeleton } from "@/components/ui/ProductDetailPageSkeleton";

export default function CommerceLoading() {
  const pathname = usePathname();
  if (pathname.includes("/products/")) return <ProductDetailPageSkeleton />;
  if (["/", "/home", "/fashion", "/beauty", "/products"].includes(pathname))
    return <CatalogPageSkeleton />;
  return (
    <div
      role="status"
      aria-label="페이지 로딩 중"
      className="mx-auto w-full max-w-[1120px] space-y-6 px-4 py-10 sm:px-8"
    >
      <div aria-hidden className="space-y-6 motion-safe:animate-pulse">
        <div className="h-9 w-48 rounded bg-gray-100" />
        <div className="grid gap-6 md:grid-cols-[2fr_1fr]">
          <div className="h-80 rounded border border-gray-100 bg-gray-50" />
          <div className="h-64 rounded border border-gray-100 bg-gray-50" />
        </div>
      </div>
    </div>
  );
}
