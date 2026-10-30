"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { usePathname } from "next/navigation";
import { explicitStoreFromPath, type StoreKey } from "@/lib/catalog/storefront";

export const useStorefrontStore = create(
  persist<{
    selected: StoreKey;
    select: (selected: StoreKey) => void;
  }>((set) => ({ selected: "home", select: (selected) => set({ selected }) }), {
    name: "revie-selected-store",
    skipHydration: true,
  }),
);

export function useActiveStore(): StoreKey {
  const selected = useStorefrontStore((s) => s.selected);
  return explicitStoreFromPath(usePathname()) ?? selected;
}
