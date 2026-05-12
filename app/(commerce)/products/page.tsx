"use client";

import { CatalogFetchError } from "@/components/commerce/catalog/CatalogFetchError";
import { CommerceCatalogPageShell } from "@/components/commerce/catalog/CommerceCatalogPageShell";
import { CommerceProductGrid } from "@/components/commerce/catalog/CommerceProductGrid";
import type { Product } from "@/components/commerce/types";
import { Button } from "@/components/ui";
import { useCartStore } from "@/commons/store/cart-store";
import { useEnrichedCatalogProducts } from "@/features/products/hooks/useEnrichedCatalogProducts";
import { useInfiniteProducts } from "@/features/products/api/useInfiniteProducts";
import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";

export default function ProductsPage() {
  const [liked, setLiked] = useState<Record<string, boolean>>({});
  const addItem = useCartStore((s) => s.addItem);

  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteProducts();

  const productsBase = useMemo(() => {
    const list = data?.pages.flatMap((p) => p.items) ?? [];
    return list.map((p) => ({
      ...p,
      isLiked: liked[p.id] ?? p.isLiked,
    }));
  }, [data, liked]);

  const { enrichedProducts } = useEnrichedCatalogProducts(productsBase);

  const toggleLike = useCallback((id: string) => {
    setLiked((prev) => ({ ...prev, [id]: !prev[id] }));
  }, []);

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

  return (
    <CommerceCatalogPageShell title="Products">
      {isError ? (
        <CatalogFetchError />
      ) : (
        <>
          <CommerceProductGrid
            products={enrichedProducts as Product[]}
            columnsClassName="grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
            gapClassName="gap-x-6 gap-y-10 md:gap-x-6 md:gap-y-12"
            loading={isLoading}
            onAddToCart={handleAddToCart}
            onWishlistToggle={toggleLike}
          />

          {hasNextPage ? (
            <div className="mt-10 flex justify-center">
              <Button
                type="button"
                variant="primary"
                size="md"
                disabled={isFetchingNextPage}
                onClick={() => fetchNextPage()}
              >
                {isFetchingNextPage ? "불러오는 중..." : "더 보기"}
              </Button>
            </div>
          ) : null}
        </>
      )}
    </CommerceCatalogPageShell>
  );
}
