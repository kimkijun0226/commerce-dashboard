"use client";

import { SearchInput } from "@/components/ui";
import { useSearchStore } from "@/features/search/store/searchStore";

export type HomeSearchBarProps = {
  className?: string;
};

export function HomeSearchBar({ className }: HomeSearchBarProps) {
  const keyword = useSearchStore((s) => s.keyword);
  const setKeyword = useSearchStore((s) => s.setKeyword);
  const clear = useSearchStore((s) => s.clear);

  return (
    <SearchInput
      id="home-search-input"
      className={className}
      placeholder="Search products..."
      actionLabel=""
      value={keyword}
      onChange={(e) => setKeyword(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === "Escape") clear();
      }}
      aria-label="상품 검색"
    />
  );
}

