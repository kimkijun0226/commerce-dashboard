"use client";

import { HomeCatalogSection } from "@/components/commerce/home/HomeCatalogSection";
import { HomeHeroSection } from "@/components/commerce/home/HomeHeroSection";
import type { Product } from "@/components/commerce/types";
import { useInfiniteScroll } from "@/commons/hooks/useInfiniteScroll";
import { useEnrichedCatalogProducts } from "@/features/products/hooks/useEnrichedCatalogProducts";
import { useInfiniteProducts } from "@/features/products/api/useInfiniteProducts";
import { useProductSearch } from "@/features/search/api/useProductSearch";
import { useSearchStore } from "@/features/search/store/searchStore";
import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
import { getLikedProductIds } from "@/app/(commerce)/likes/actions";
import { useSessionStore } from "@/commons/store/session-store";
import { useCartStore } from "@/commons/store/cart-store";
import { getGuestLikedIds } from "@/components/commerce/likes/guestLikes";
import { toast } from "sonner";

export type HomePageProps = {
  initialItems?: Product[];
};

export function HomePage({ initialItems }: HomePageProps) {
  const isAuthed = useSessionStore((s) => s.isAuthenticated);
  const likesSyncNonce = useSessionStore((s) => s.likesSyncNonce);
  const addItem = useCartStore((s) => s.addItem);
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
  } = useInfiniteProducts({ initialItems });

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
    return list;
  }, [data, keyword, searched]);

  const [likedMap, setLikedMap] = useState<Record<string, boolean>>({});
  const [pendingLikes, startLikes] = useTransition();
  const lastIdsKeyRef = useRef<string>("");

  // ✅ 메인 페이지는 카드별 조회(N+1) 대신 배치로 liked를 미리 주입
  useEffect(() => {
    const ids = Array.from(new Set(productsBase.map((p) => p.id))).sort();
    const idsKey = ids.join(",");
    if (!idsKey) return;

    // 같은 id set으로는 중복 호출 방지(렌더 루프 차단)
    if (lastIdsKeyRef.current === idsKey) return;
    lastIdsKeyRef.current = idsKey;

    startLikes(async () => {
      try {
        if (!isAuthed) {
          const guest = new Set(getGuestLikedIds());
          const next: Record<string, boolean> = {};
          for (const id of ids) {
            if (guest.has(id)) next[id] = true;
          }
          setLikedMap(next);
          return;
        }
        const likedIds = await getLikedProductIds(ids);
        const next: Record<string, boolean> = {};
        for (const id of likedIds) next[id] = true;
        setLikedMap(next);
      } catch {
        // 실패 시 guest 기준으로 폴백
        const guest = new Set(getGuestLikedIds());
        const next: Record<string, boolean> = {};
        for (const id of ids) {
          if (guest.has(id)) next[id] = true;
        }
        setLikedMap(next);
      }
    });
  }, [productsBase, startLikes, isAuthed, likesSyncNonce]);

  // 동기화가 끝난 경우, 같은 idsKey라도 재조회가 필요하니 gate를 한번 풀어줌
  useEffect(() => {
    lastIdsKeyRef.current = "";
  }, [likesSyncNonce]);

  const productsWithLikes = useMemo(() => {
    if (!pendingLikes && Object.keys(likedMap).length === 0) return productsBase;
    return productsBase.map((p) => ({
      ...p,
      isLiked: likedMap[p.id] ?? p.isLiked,
    }));
  }, [likedMap, pendingLikes, productsBase]);

  const { enrichedProducts } = useEnrichedCatalogProducts(productsWithLikes);

  const handleAddToCart = useCallback(
    async (product: Product) => {
      const ok = await addItem(
        {
          id: product.id,
          name: product.name,
          price: product.price,
          salePrice: product.salePrice ?? null,
          imageUrl: product.imageUrl,
          status: "visible",
        },
        1,
      );
      if (ok) toast.success("장바구니에 담았습니다.");
      else toast.error("장바구니에 담지 못했습니다.");
    },
    [addItem],
  );

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
      />

      <HomeHeroSection />
    </div>
  );
}
