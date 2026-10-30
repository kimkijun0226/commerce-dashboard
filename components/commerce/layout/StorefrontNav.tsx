"use client";
import Link from "next/link";
import type { CSSProperties } from "react";
import { STOREFRONTS, type StoreKey } from "@/lib/catalog/storefront";
export const STORE_LABELS = {
  home: "LIVING",
  fashion: "FASHION",
  beauty: "BEAUTY",
} as const;
export function StorefrontNav({ active }: { active: StoreKey }) {
  return (
    <nav
      aria-label="Store selection"
      className="storefront-nav"
      style={
        {
          "--store-index": Object.keys(STOREFRONTS).indexOf(active),
        } as CSSProperties
      }
    >
      <span className="storefront-nav-indicator" aria-hidden />
      {Object.values(STOREFRONTS).map((store) => (
        <Link
          key={store.key}
          href={store.path}
          aria-current={active === store.key ? "page" : undefined}
          className="storefront-nav-link"
        >
          <span>{STORE_LABELS[store.key]}</span>
        </Link>
      ))}
    </nav>
  );
}
