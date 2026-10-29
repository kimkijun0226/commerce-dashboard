"use client";
import { useSearchStore } from "@/features/search/store/searchStore";
import Link from "next/link";
import { STOREFRONTS, type StoreKey } from "@/lib/catalog/storefront";
export function StorefrontNav({ active }: { active: StoreKey }) {
  const clearSearch = useSearchStore(s => s.clear);
  return <nav aria-label="오브온 매장 선택" className="mb-5 flex items-center gap-1 border-b border-(--commerce-border-subtle)">
    {Object.values(STOREFRONTS).map(store => <Link key={store.key} href={store.path} onClick={() => { if (active !== store.key) clearSearch(); }} aria-current={active === store.key ? "page" : undefined}
      className={`relative -mb-px flex min-h-12 items-center gap-2 border-b-2 px-5 text-sm transition-colors duration-150 sm:px-7 ${active === store.key ? "border-(--commerce-primary-main) font-semibold text-(--commerce-primary-main)" : "border-transparent text-(--commerce-text-secondary) hover:text-(--commerce-text-primary)"}`}>
      {store.label}<span className="hidden text-[10px] tracking-widest opacity-60 sm:inline">{store.name === "의류" ? "WARDROBE" : store.key.toUpperCase()}</span>
    </Link>)}
    <p className="ml-auto hidden text-xs text-(--commerce-text-secondary) lg:block">취향이 켜지는 순간, 오브온.</p>
  </nav>;
}
