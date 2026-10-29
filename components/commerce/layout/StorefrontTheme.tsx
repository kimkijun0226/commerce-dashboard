"use client";
import { usePathname } from "next/navigation";
import { storeFromPath } from "@/lib/catalog/storefront";
export function StorefrontTheme({ children }: { children: React.ReactNode }) {
  return <div data-store={storeFromPath(usePathname())} className="flex min-h-screen flex-col bg-(--commerce-background-default) text-(--commerce-text-primary)">{children}</div>;
}
