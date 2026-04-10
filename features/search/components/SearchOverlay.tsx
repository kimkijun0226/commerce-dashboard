"use client";

import type { Product } from "@/components/commerce/types";
import { ProductCard } from "@/components/commerce/ProductCard/ProductCard";
import { ProductGrid } from "@/components/commerce/ProductGrid/ProductGrid";
import { LoadingSpinner, SearchInput, cn } from "@/components/ui";
import { useInfiniteScroll } from "@/commons/hooks/useInfiniteScroll";
import { useInfiniteProducts } from "@/features/products/api/useInfiniteProducts";
import { useProductSearch } from "@/features/search/api/useProductSearch";
import { useSearchStore } from "@/features/search/store/searchStore";
import { useCallback, useMemo, useRef } from "react";
import { FiX } from "react-icons/fi";

export type SearchOverlayProps = {
  className?: string;
};

export function SearchOverlay({ className }: SearchOverlayProps) {
  const isOpen = useSearchStore((s) => s.isOpen);
  const keyword = useSearchStore((s) => s.keyword);
  const close = useSearchStore((s) => s.close);
  const setKeyword = useSearchStore((s) => s.setKeyword);

  const {
    data: infiniteData,
    isLoading: isInfiniteLoading,
    isError: isInfiniteError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteProducts();

  const {
    data: searched,
    isLoading: isSearchLoading,
    isError: isSearchError,
  } = useProductSearch(keyword);

  const allProducts = useMemo(() => {
    return infiniteData?.pages.flatMap((p) => p.items) ?? [];
  }, [infiniteData]);

  const onLoadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) fetchNextPage();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  const loadMoreRef = useInfiniteScroll({
    onLoadMore,
    enabled: hasNextPage === true && isFetchingNextPage === false && keyword.trim().length === 0,
  });

  const overlayRef = useRef<HTMLDivElement | null>(null);

  const showSearch = keyword.trim().length > 0;
  const list = (showSearch ? searched ?? [] : allProducts) as Product[];
  const showLoading = showSearch ? isSearchLoading : isInfiniteLoading;
  const showError = showSearch ? isSearchError : isInfiniteError;

  return (
    <div
      ref={overlayRef}
      className={cn(
        "fixed inset-x-0 bottom-0 top-[60px] z-100",
        "bg-(--commerce-background-default)",
        "transition-all duration-200 ease-out",
        isOpen ? "translate-y-0 opacity-100" : "-translate-y-4 opacity-0 pointer-events-none",
        className,
      )}
      aria-label="검색 오버레이"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) close();
      }}
      onKeyDown={(e) => {
        if (e.key === "Escape") close();
      }}
      tabIndex={-1}
    >
      <div className="mx-auto flex h-full max-w-[1320px] flex-col px-4 sm:px-10">
        {/* top bar */}
        <div className="flex h-[72px] items-center gap-4 border-b border-(--commerce-border-subtle)">
          <h2
            className="shrink-0 text-[18px] font-medium leading-6 text-(--commerce-text-primary)"
            style={{ fontFamily: "var(--commerce-font-heading)" }}
          >
            Search
          </h2>

          <div className="min-w-0 flex-1">
            <SearchInput
              placeholder="Search products..."
              actionLabel=""
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Escape") close();
              }}
            />
          </div>

          <button
            type="button"
            className={cn(
              "inline-flex size-10 items-center justify-center rounded-md",
              "text-(--commerce-text-primary)",
              "outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--commerce-semantic-info)",
            )}
            aria-label="검색 닫기"
            onClick={() => close()}
          >
            <FiX className="size-6" aria-hidden />
          </button>
        </div>

        {/* results */}
        <div className="flex-1 overflow-auto py-8">
          {showError ? (
            <div className="rounded-2xl border border-(--commerce-border-subtle) bg-(--commerce-background-default) p-6 text-(--commerce-text-secondary)">
              검색 결과를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.
            </div>
          ) : (
            <div>
              <ProductGrid
                products={list}
                columnsClassName="grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
                gapClassName="gap-6 md:gap-8"
                loading={showLoading}
                renderItem={(p) => <ProductCard product={p} />}
              />

              {!showSearch && hasNextPage ? <div ref={loadMoreRef} className="h-8" /> : null}
              {!showSearch && isFetchingNextPage ? <LoadingSpinner className="mt-8" /> : null}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

