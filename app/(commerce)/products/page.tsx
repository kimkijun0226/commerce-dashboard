"use client";

import { ProductGrid } from "@/components/commerce/ProductGrid/ProductGrid";
import { ProductCard } from "@/components/commerce/ProductCard/ProductCard";
import type { Product } from "@/components/commerce/types";
import { Button } from "@/components/ui";
import { useInfiniteProducts } from "@/features/products/api/useInfiniteProducts";
import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";

export default function ProductsPage() {
  const router = useRouter();
  const [liked, setLiked] = useState<Record<string, boolean>>({});

  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteProducts();

  const products = useMemo(() => {
    const list = data?.pages.flatMap((p) => p.items) ?? [];
    return list.map((p) => ({
      ...p,
      isLiked: liked[p.id] ?? p.isLiked,
    }));
  }, [data, liked]);

  const toggleLike = useCallback((id: string) => {
    setLiked((prev) => ({ ...prev, [id]: !prev[id] }));
  }, []);

  return (
    <div className="mx-auto max-w-[1440px] px-4 py-10 sm:px-[160px]">
      <section aria-label="상품 목록 페이지">
        <header className="mb-12 flex items-center justify-center gap-4">
          <h1
            className="text-[28px] font-medium leading-7 text-(--commerce-text-primary)"
            style={{ fontFamily: "var(--commerce-font-heading)" }}
          >
            Products
          </h1>
        </header>

        {isError ? (
          <div className="rounded-2xl border border-(--commerce-border-subtle) bg-(--commerce-background-default) p-6 text-(--commerce-text-secondary)">
            상품을 불러오지 못했습니다. 잠시 후 다시 시도해주세요.
          </div>
        ) : (
          <div>
            <ProductGrid
              products={products as Product[]}
              columnsClassName="grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
              gapClassName="gap-x-6 gap-y-10 md:gap-x-6 md:gap-y-12"
              loading={isLoading}
              renderItem={(p) => (
                <ProductCard
                  product={p}
                  onAddToCart={() => router.push("/cart")}
                  onWishlistToggle={() => toggleLike(p.id)}
                />
              )}
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
          </div>
        )}
      </section>
    </div>
  );
}
