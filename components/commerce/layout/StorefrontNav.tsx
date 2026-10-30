"use client";
import { useSearchStore } from "@/features/search/store/searchStore";
import Link from "next/link";
import { STOREFRONTS, type StoreKey } from "@/lib/catalog/storefront";
export function StorefrontNav({ active }: { active: StoreKey }) {
  const clearSearch = useSearchStore(s => s.clear);
  return <nav aria-label="레비 매장 선택" className="flex items-center gap-1">
    {Object.values(STOREFRONTS).map(store => <Link key={store.key} href={store.path} onClick={() => { if (active !== store.key) clearSearch(); }} aria-current={active === store.key ? "page" : undefined}
      className={`flex min-h-10 items-center border-b-2 px-3 text-sm transition-colors duration-150 ${active === store.key ? "border-(--commerce-primary-main) font-semibold text-(--commerce-primary-main)" : "border-transparent text-(--commerce-text-secondary) hover:text-(--commerce-text-primary)"}`}>
      {store.label}
    </Link>)}
  </nav>;
}
