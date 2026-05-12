"use client";

import { LikeEmptyState } from "@/components/account/wishlist/LikeEmptyState";
import { LikeListTable, type LikeListItem } from "@/components/account/wishlist/LikeListTable";

export function LikeListSection({ items }: { items: LikeListItem[] }) {
  if (items.length === 0) {
    return <LikeEmptyState />;
  }
  return <LikeListTable items={items} />;
}

