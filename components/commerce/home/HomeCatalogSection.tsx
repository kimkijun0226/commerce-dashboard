"use client";

import { CatalogFetchError } from "@/components/commerce/catalog/CatalogFetchError";
import { CommerceProductGrid } from "@/components/commerce/catalog/CommerceProductGrid";
import type { Product } from "@/components/commerce/types";
import { LoadingSpinner, cn } from "@/components/ui";
import { HomeSearchBar } from "@/features/search/components/HomeSearchBar";
import type { CatalogCategory } from "@/lib/catalog/products";
import type { RefObject } from "react";
import { useEffect } from "react";
import { FiRotateCcw, FiSearch } from "react-icons/fi";

export type HomeCatalogSectionProps = {
  categories: CatalogCategory[];
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  onResetFilters: () => void;
  total: number;
  allTotal: number;
  keyword: string;
  isSearchOpen: boolean;
  onSearchFocusHandled: () => void;
  onCloseSearch: () => void;
  showFetchError: boolean;
  isProductLoading: boolean;
  products: Product[];
  loadMoreRef: RefObject<HTMLDivElement | null>;
  showLoadMoreSentinel: boolean;
  isFetchingNextPage: boolean;
  onAddToCart: (product: Product) => void;
  onWishlistToggle?: (productId: string) => void;
};

export function HomeCatalogSection({
  categories, selectedCategory, onCategoryChange, onResetFilters,
  total, allTotal, keyword, isSearchOpen, onSearchFocusHandled, onCloseSearch, showFetchError,
  isProductLoading, products, loadMoreRef, showLoadMoreSentinel,
  isFetchingNextPage, onAddToCart, onWishlistToggle,
}: HomeCatalogSectionProps) {
  useEffect(() => {
    if (!isSearchOpen) return;
    const id = window.requestAnimationFrame(() => {
      const el = document.getElementById("home-search-input") as HTMLInputElement | null;
      el?.scrollIntoView({ behavior: "smooth", block: "center" });
      el?.focus();
      onSearchFocusHandled();
    });
    return () => window.cancelAnimationFrame(id);
  }, [isSearchOpen, onSearchFocusHandled]);

  const hasFilters = Boolean(keyword.trim() || selectedCategory);
  const choices = [{ name: "All", value: "", count: allTotal }, ...categories.map((category) => ({
    name: category.name, value: category.name, count: category.productCount,
  }))];

  return (
    <section aria-label="상품 목록">
      <header className="mb-6 border-b border-[#e8ebed] pb-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[10px] font-semibold tracking-[0.2em] text-[#949ca3]">THE COLLECTION</p>
            <h1 className="mt-1.5 text-2xl font-bold tracking-[-0.8px] text-[#141718] sm:text-[28px]">상품 둘러보기</h1>
          </div>
          <div id="home-search-region" className="w-full sm:max-w-[420px]">
            <HomeSearchBar className="rounded-xl !border-transparent !bg-[#f4f5f6] !px-4 !py-3 focus-within:ring-2 focus-within:ring-[#141718]/15" onEscape={onCloseSearch} />
          </div>
        </div>
        <div role="group" aria-label="상품 카테고리" className="mt-5 flex flex-wrap items-center gap-2 pb-1">
          {choices.map((choice) => {
            const active = choice.value === selectedCategory;
            return (
              <button key={choice.value} type="button" aria-pressed={active} onClick={() => onCategoryChange(choice.value)}
                className={cn("inline-flex min-h-10 shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2",
                  active ? "bg-[#141718] font-semibold text-white" : "bg-[#f4f5f6] text-[#626a71] hover:bg-[#e9ecee] hover:text-black")}>
                {choice.name}
                <span className={cn("text-[10px] tabular-nums", active ? "text-white/50" : "text-[#9ba2a8]")}>{choice.count}</span>
              </button>
            );
          })}
        </div>
      </header>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-baseline gap-2">
          <h2 className="text-lg font-semibold text-(--commerce-text-primary)">{selectedCategory || "전체 상품"}</h2>
          <p role="status" aria-live="polite" className="text-sm text-(--commerce-text-secondary)">
            {isProductLoading ? "상품을 찾고 있어요…" : showFetchError ? "조회할 수 없습니다" : `${keyword.trim() ? `“${keyword.trim()}” 검색 결과 · ` : ""}${total.toLocaleString("ko-KR")}개`}
          </p>
        </div>
        {hasFilters ? (
          <button type="button" onClick={onResetFilters} className="inline-flex min-h-10 items-center gap-1.5 rounded-lg px-2 text-xs text-[#6c7275] hover:bg-[#f3f5f7] focus-visible:outline-2">
            <FiRotateCcw aria-hidden /> 필터 초기화
          </button>
        ) : null}
      </div>

      {showFetchError ? <CatalogFetchError /> : !isProductLoading && products.length === 0 ? (
        <div className="flex flex-col items-center rounded-2xl border border-dashed border-[#dce0e3] px-4 py-20 text-center">
          <FiSearch className="mb-4 size-8 text-[#9ca4aa]" aria-hidden />
          <h3 className="text-lg font-semibold">조건에 맞는 상품이 없어요</h3>
          <p className="mt-2 text-sm text-[#6c7275]">다른 검색어를 입력하거나 카테고리를 바꿔 보세요.</p>
          <button type="button" onClick={onResetFilters} className="mt-5 rounded-full bg-[#141718] px-5 py-3 text-sm text-white focus-visible:outline-2 focus-visible:outline-offset-2">전체 상품 보기</button>
        </div>
      ) : (
        <div aria-busy={isProductLoading || isFetchingNextPage}>
          <CommerceProductGrid
            products={products}
            columnsClassName="grid-cols-2 min-[480px]:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 2xl:grid-cols-6"
            gapClassName="gap-x-3 gap-y-7 sm:gap-x-5 sm:gap-y-9"
            loading={isProductLoading}
            onAddToCart={onAddToCart}
            onWishlistToggle={onWishlistToggle}
          />
          {showLoadMoreSentinel ? <div ref={loadMoreRef} className="h-8" /> : null}
          {isFetchingNextPage ? <LoadingSpinner className="mt-8" /> : null}
        </div>
      )}
    </section>
  );
}
