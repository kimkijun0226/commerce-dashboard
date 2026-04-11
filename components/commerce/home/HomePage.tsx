"use client";

import { HomeCatalogSection } from "@/components/commerce/home/HomeCatalogSection";
import { HomeHeroSection } from "@/components/commerce/home/HomeHeroSection";
import type { Product } from "@/components/commerce/types";
import { useInfiniteScroll } from "@/commons/hooks/useInfiniteScroll";
import { useEnrichedCatalogProducts } from "@/features/products/hooks/useEnrichedCatalogProducts";
import { useInfiniteProducts } from "@/features/products/api/useInfiniteProducts";
import { useProductSearch } from "@/features/search/api/useProductSearch";
import { useSearchStore } from "@/features/search/store/searchStore";
import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";

export function HomePage() {
  const router = useRouter();
  const [liked, setLiked] = useState<Record<string, boolean>>({});
  const keyword = useSearchStore((s) => s.keyword);
  const isSearchOpen = useSearchStore((s) => s.isOpen);
  const closeSearch = useSearchStore((s) => s.close);

  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteProducts();

  const {
    data: searched,
    isLoading: isSearchLoading,
    isError: isSearchError,
  } = useProductSearch(keyword);

  const productsBase = useMemo(() => {
    const showSearch = keyword.trim().length > 0;
    const list = showSearch
      ? (searched ?? [])
      : (data?.pages.flatMap((p) => p.items) ?? []);
    return list.map((p) => ({
      ...p,
      isLiked: liked[p.id] ?? p.isLiked,
    }));
  }, [data, keyword, liked, searched]);

  const { enrichedProducts } = useEnrichedCatalogProducts(productsBase);

  const toggleLike = useCallback((id: string) => {
    setLiked((prev) => ({ ...prev, [id]: !prev[id] }));
  }, []);

  const handleAddToCart = useCallback(() => {
    router.push("/cart");
  }, [router]);

  const loadMoreRef = useInfiniteScroll({
    onLoadMore: () => {
      if (hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    },
    enabled:
      keyword.trim().length === 0 &&
      hasNextPage === true &&
      isFetchingNextPage === false,
  });

  const showSearch = keyword.trim().length > 0;

  return (
    <div className="mx-auto max-w-[1440px] px-4 py-10 sm:px-[160px]">
      <HomeCatalogSection
        title="All"
        keyword={keyword}
        isSearchOpen={isSearchOpen}
        onCloseSearch={closeSearch}
        showFetchError={isError || isSearchError}
        isProductLoading={showSearch ? isSearchLoading : isLoading}
        products={enrichedProducts as Product[]}
        loadMoreRef={loadMoreRef}
        showLoadMoreSentinel={!showSearch && hasNextPage === true}
        isFetchingNextPage={isFetchingNextPage}
        onAddToCart={handleAddToCart}
        onWishlistToggle={toggleLike}
      />

      <HomeHeroSection />
    </div>
  );
}
