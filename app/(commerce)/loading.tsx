"use client";

import { usePathname } from "next/navigation";
import { CatalogPageSkeleton } from "@/components/commerce/catalog/CatalogPageSkeleton";
import { ProductDetailPageSkeleton } from "@/components/ui/ProductDetailPageSkeleton";

export default function CommerceLoading() {
  const pathname = usePathname();
  return pathname.startsWith("/products/") ? <ProductDetailPageSkeleton /> : <CatalogPageSkeleton />;
}
