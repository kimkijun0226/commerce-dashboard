"use client";

import { SearchInput } from "@/components/ui";
import { useSearchStore } from "@/features/search/store/searchStore";

export type HomeSearchBarProps = {
  className?: string;
  /** input 요소 id (동일 페이지에 검색바가 여러 개일 때 구분) */
  inputId?: string;
  /** 지정 시 ESC에서 호출. 미지정 시 검색어·패널 상태까지 `clear()` */
  onEscape?: () => void;
};

export function HomeSearchBar({
  className,
  inputId = "home-search-input",
  onEscape,
}: HomeSearchBarProps) {
  const keyword = useSearchStore((s) => s.keyword);
  const setKeyword = useSearchStore((s) => s.setKeyword);
  const clear = useSearchStore((s) => s.clear);

  return (
    <SearchInput
      id={inputId}
      className={className}
      placeholder="Search products..."
      actionLabel=""
      value={keyword}
      onChange={(e) => setKeyword(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === "Escape") {
          if (onEscape) onEscape();
          else clear();
        }
      }}
      aria-label="상품 검색"
    />
  );
}

