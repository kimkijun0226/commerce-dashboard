"use client";

import { usePathname } from "next/navigation";
import { storeFromPath } from "@/lib/catalog/storefront";
import { StorefrontNav } from "@/components/commerce/layout/StorefrontNav";
import { LoadingSkeletonGrid } from "@/components/commerce/ProductGrid/LoadingSkeletonGrid";

export function CatalogPageSkeleton() {
  const department = storeFromPath(usePathname());
  return (
    <div className="mx-auto max-w-[1800px] px-4 py-6 sm:px-6 lg:px-8">
      <StorefrontNav active={department} />
      <div aria-hidden className="mb-5 h-[400px] rounded-[3px] bg-(--commerce-background-elevated) motion-safe:animate-pulse sm:h-[420px] lg:h-[480px]" />
      <div aria-hidden className="mb-6 flex flex-wrap gap-2 border-b border-(--commerce-border-subtle) pb-4 motion-safe:animate-pulse">
        {[76, 80, 80, 80, 80, 92, 80].map((width, i) => <div key={i} style={{ width }} className="h-10 rounded-[3px] bg-(--commerce-background-light)" />)}
      </div>
      <div aria-hidden className="mb-6 flex h-7 items-center gap-2 motion-safe:animate-pulse">
        <div className="h-5 w-20 rounded bg-[#e8ebed]" />
        <div className="h-3 w-10 rounded bg-[#f0f2f4]" />
      </div>
      <LoadingSkeletonGrid />
    </div>
  );
}
