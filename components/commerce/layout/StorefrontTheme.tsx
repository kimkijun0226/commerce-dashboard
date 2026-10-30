"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { explicitStoreFromPath } from "@/lib/catalog/storefront";
import {
  useActiveStore,
  useStorefrontStore,
} from "@/commons/store/storefront-store";
export function StorefrontTheme({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const store = useActiveStore();
  useEffect(() => {
    void useStorefrontStore.persist.rehydrate();
    const explicit = explicitStoreFromPath(pathname);
    if (explicit) useStorefrontStore.getState().select(explicit);
  }, [pathname]);
  return (
    <div
      data-store={store}
      className="flex min-h-screen flex-col bg-(--commerce-background-default) text-(--commerce-text-primary)"
    >
      {children}
    </div>
  );
}
