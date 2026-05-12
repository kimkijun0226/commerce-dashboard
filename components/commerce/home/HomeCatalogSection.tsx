"use client";

import { CatalogFetchError } from "@/components/commerce/catalog/CatalogFetchError";
import { CommerceProductGrid } from "@/components/commerce/catalog/CommerceProductGrid";
import type { Product } from "@/components/commerce/types";
import { LoadingSpinner, cn } from "@/components/ui";
import { HomeSearchBar } from "@/features/search/components/HomeSearchBar";
import type { RefObject } from "react";
import { useEffect } from "react";

export type HomeCatalogSectionProps = {
  title: string;
  keyword: string;
  isSearchOpen: boolean;
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
  title,
  keyword,
  isSearchOpen,
  onCloseSearch,
  showFetchError,
  isProductLoading,
  products,
  loadMoreRef,
  showLoadMoreSentinel,
  isFetchingNextPage,
  onAddToCart,
  onWishlistToggle,
}: HomeCatalogSectionProps) {
  useEffect(() => {
    if (!isSearchOpen) return;
    const id = window.requestAnimationFrame(() => {
      const el = document.getElementById(
        "home-search-input",
      ) as HTMLInputElement | null;
      el?.scrollIntoView({ behavior: "smooth", block: "center" });
      el?.focus();
    });
    return () => window.cancelAnimationFrame(id);
  }, [isSearchOpen]);

  return (
    <section aria-label="상품 목록">
      <header className="mb-12 flex flex-col items-center justify-center gap-6">
        <h1
          className="text-[28px] font-medium leading-7 text-(--commerce-text-primary)"
          style={{ fontFamily: "var(--commerce-font-heading)" }}
        >
          {title}
        </h1>
        <div
          id="home-search-region"
          className={cn(
            "w-full max-w-[720px] overflow-hidden transition-all duration-200 ease-out",
            isSearchOpen
              ? "max-h-[120px] opacity-100"
              : "pointer-events-none max-h-0 opacity-0",
          )}
          aria-hidden={!isSearchOpen}
        >
          {isSearchOpen ? (
            <HomeSearchBar onEscape={() => onCloseSearch()} />
          ) : null}
        </div>
      </header>

      {showFetchError ? (
        <CatalogFetchError />
      ) : (
        <div>
          <CommerceProductGrid
            products={products}
            columnsClassName="grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
            gapClassName="gap-x-6 gap-y-10 md:gap-x-6 md:gap-y-12"
            loading={isProductLoading}
            onAddToCart={onAddToCart}
            onWishlistToggle={onWishlistToggle}
          />

          {showLoadMoreSentinel ? (
            <div ref={loadMoreRef} className="h-8" />
          ) : null}
          {keyword.trim().length === 0 && isFetchingNextPage ? (
            <LoadingSpinner className="mt-8" />
          ) : null}
        </div>
      )}
    </section>
  );
}
