"use client";

import { usePathname } from "next/navigation";
import { STOREFRONTS, storeFromPath } from "@/lib/catalog/storefront";
import { StorefrontNav } from "@/components/commerce/layout/StorefrontNav";
import { LoadingSkeletonGrid } from "@/components/commerce/ProductGrid/LoadingSkeletonGrid";

export function CatalogPageSkeleton() {
  const department = storeFromPath(usePathname());
  const store = STOREFRONTS[department];
  return (
    <div className="mx-auto max-w-[1800px] px-4 py-6 sm:px-6 lg:px-8">
      <StorefrontNav active={department} />
      <header aria-hidden className="mb-6 rounded-[3px] border border-(--commerce-border-subtle) p-4 sm:p-7" style={{ background: "var(--store-hero)" }}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[10px] font-semibold tracking-[0.2em] text-[#949ca3]">{store.eyebrow}</p>
            <h1 className="mt-1.5 text-2xl font-bold tracking-[-0.8px] text-[#141718] sm:text-[28px]">{store.title}</h1>
            <p className="mt-2 max-w-lg text-xs leading-6 text-(--commerce-text-secondary) sm:text-sm">{store.description}</p>
          </div>
          <div className="h-[52px] w-full rounded-[3px] bg-[#f4f5f6] motion-safe:animate-pulse sm:max-w-[420px]" />
        </div>
        <div className="mt-5 flex flex-wrap items-center gap-2 pb-1 motion-safe:animate-pulse">
          {[76, 80, 80, 80, 80, 92, 80].map((width, i) => (
            <div key={i} style={{ width }} className="h-10 shrink-0 rounded-[3px] bg-[#f4f5f6]" />
          ))}
        </div>
      </header>
      <div aria-hidden className="mb-8 h-[242px] rounded-[3px] border border-(--commerce-border-subtle) bg-(--commerce-bg-light) motion-safe:animate-pulse sm:h-[282px]" />
      <div aria-hidden className="mb-6 flex h-7 items-center gap-2 motion-safe:animate-pulse">
        <div className="h-5 w-20 rounded bg-[#e8ebed]" />
        <div className="h-3 w-10 rounded bg-[#f0f2f4]" />
      </div>
      <LoadingSkeletonGrid />
    </div>
  );
}
