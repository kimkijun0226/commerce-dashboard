"use client";
import { useSearchStore } from "@/features/search/store/searchStore";
import Link from "next/link";
import { STOREFRONTS, type StoreKey } from "@/lib/catalog/storefront";
export const STORE_LABELS = { home: "LIVING", fashion: "FASHION", beauty: "BEAUTY" } as const;
export function StorefrontNav({ active }: { active: StoreKey }) {
  const clearSearch = useSearchStore(s => s.clear);
  return <nav aria-label="Store selection" className="storefront-nav">
    {Object.values(STOREFRONTS).map(store => <Link key={store.key} href={store.path} onClick={() => { if (active !== store.key) clearSearch(); }} aria-current={active === store.key ? "page" : undefined}
      className="storefront-nav-link">
      <span className="storefront-nav-dot" aria-hidden />
      <span>{STORE_LABELS[store.key]}</span>
    </Link>)}
  </nav>;
}
