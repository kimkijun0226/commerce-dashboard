"use client";

import { catalogFilterLocation, type CampaignBanner, type CampaignFilter } from "@/lib/catalog/campaigns";
import { explicitStoreFromPath, type StoreKey } from "@/lib/catalog/storefront";
import { HomeCatalogSection } from "@/components/commerce/home/HomeCatalogSection";
import type { Product } from "@/components/commerce/types";
import { useInfiniteScroll } from "@/commons/hooks/useInfiniteScroll";
import { useInfiniteProducts, usePrefetchCatalog } from "@/features/products/api/useInfiniteProducts";
import { useDebouncedValue } from "@/commons/hooks/useDebouncedValue";
import type { CatalogCategory } from "@/lib/catalog/products";
import { useSearchStore } from "@/features/search/store/searchStore";
import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
import { getLikedProductIds } from "@/app/(commerce)/likes/actions";
import { useSessionStore } from "@/commons/store/session-store";
import { useCartStore } from "@/commons/store/cart-store";
import { getGuestLikedIds } from "@/components/commerce/likes/guestLikes";
import { toast } from "sonner";

export type HomePageProps = {
  campaigns?: CampaignBanner[];
  initialQuery?: string;
  initialCategory?: string;
  allTotal?: number;
  initialItems?: Product[];
  initialTotal?: number;
  categories: CatalogCategory[];
  department?: StoreKey;
};

export function HomePage({ campaigns, initialQuery = "", initialCategory = "", allTotal, initialItems, initialTotal, categories, department = "fashion" }: HomePageProps) {
  const isAuthed = useSessionStore((s) => s.isAuthenticated);
  const likesSyncNonce = useSessionStore((s) => s.likesSyncNonce);
  const addItem = useCartStore((s) => s.addItem);
  const [keyword, setLocalKeyword] = useState(initialQuery);
  const setKeyword = useSearchStore((s) => s.setKeyword);
  const prefetchCatalog = usePrefetchCatalog(department);
  const [category, setCategory] = useState(initialCategory);

  useEffect(() => useSearchStore.subscribe((state, previous) => {
    if (state.keyword !== previous.keyword) setLocalKeyword(state.keyword);
  }), []);
  useEffect(() => { setKeyword(initialQuery); }, [initialQuery, setKeyword]);
  useEffect(() => {
    const restore = () => { const params = new URLSearchParams(window.location.search); setCategory(params.get("category") ?? ""); setKeyword(params.get("q") ?? ""); };
    window.addEventListener("popstate", restore);
    return () => window.removeEventListener("popstate", restore);
  }, [setKeyword]);
  const applyFilters = (filter: CampaignFilter, scroll = false) => {
    setCategory(filter.category ?? "");
    setKeyword(filter.q ?? "");
    window.history.pushState(window.history.state, "", catalogFilterLocation(window.location.href, filter, scroll));
    if (scroll) document.getElementById("catalog-products")?.scrollIntoView({ block: "start" });
  };
  const debouncedKeyword = useDebouncedValue(keyword.trim(), 350);
  const isSearchPending = keyword.trim() !== debouncedKeyword;

  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteProducts({ initialItems, initialTotal, initialQuery, initialCategory, q: debouncedKeyword, category, department });

  useEffect(() => {
    if (debouncedKeyword) return;
    let cancelled = false;
    const prepareCategories = async () => {
      for (const item of categories.slice(0, 6)) {
        if (cancelled) break;
        await prefetchCatalog("", item.name, 3);
      }
    };
    // Start after the initial viewport has had a chance to load; keep image priority low.
    const timer = window.setTimeout(() => { void prepareCategories(); }, 1200);
    return () => { cancelled = true; window.clearTimeout(timer); };
  }, [categories, debouncedKeyword, prefetchCatalog]);

  const productsBase = useMemo(() => data?.pages.flatMap((p) => p.items) ?? [], [data]);
  const resetFilters = () => applyFilters({});
  useEffect(() => {
    if (explicitStoreFromPath(window.location.pathname) === department && keyword.trim() === debouncedKeyword) {
      window.history.replaceState(window.history.state, "", catalogFilterLocation(window.location.href, { category, q: debouncedKeyword }));
    }
  }, [category, debouncedKeyword, department, keyword]);

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


  const handleAddToCart = useCallback(
    async (product: Product, selectedOptions?: Record<string, string>) => {
      const ok = await addItem(
        {
          id: product.id,
          name: product.name,
          price: product.price,
          salePrice: product.salePrice ?? null,
          imageUrl: product.imageUrl,
          status: "visible",
          selectedOptions,
        },
        1,
      );
      if (ok) toast.success("장바구니에 담았습니다.");
      else toast.error("장바구니에 담지 못했습니다.");
      return ok;
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
      !isSearchPending &&
      hasNextPage === true &&
      isFetchingNextPage === false,
  });

  return (
    <div className="mx-auto max-w-[1800px] px-4 py-6 sm:px-6 lg:px-8">
      <HomeCatalogSection
        campaigns={campaigns}
        department={department}
        categories={categories}
        selectedCategory={category}
        onCampaignSelect={(filter) => applyFilters(filter, true)}
        onCategoryChange={(value) => applyFilters({ category: value, q: keyword })}
        onCategoryIntent={(value) => { void prefetchCatalog(debouncedKeyword, value); }}
        onResetFilters={resetFilters}
        total={data?.pages[0]?.total ?? 0}
        allTotal={allTotal ?? initialTotal ?? 0}
        keyword={keyword}
        showFetchError={isError}
        isProductLoading={isLoading || isSearchPending}
        products={productsWithLikes as Product[]}
        loadMoreRef={loadMoreRef}
        showLoadMoreSentinel={!isSearchPending && hasNextPage === true}
        isFetchingNextPage={isFetchingNextPage}
        onAddToCart={handleAddToCart}
      />

    </div>
  );
}
