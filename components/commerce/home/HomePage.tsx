"use client";

import { ProductGrid } from "@/components/commerce/ProductGrid/ProductGrid";
import { ProductCard } from "@/components/commerce/ProductCard/ProductCard";
import type { Product } from "@/components/commerce/types";
import { useProductsQuery } from "@/features/products/api/useProductsQuery";
import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";

export function HomePage() {
  const router = useRouter();
  const [liked, setLiked] = useState<Record<string, boolean>>({});

  const { data, isLoading, isError } = useProductsQuery({ limit: 12 });

  const products = useMemo(() => {
    const list = data ?? [];
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
      <section aria-label="상품 목록">
        <header className="mb-12 flex items-center justify-center gap-4">
          <h1
            className="text-[28px] font-medium leading-7 text-(--commerce-text-primary)"
            style={{ fontFamily: "var(--commerce-font-heading)" }}
          >
            All
          </h1>
        </header>

        {isError ? (
          <div className="rounded-2xl border border-(--commerce-border-subtle) bg-(--commerce-background-default) p-6 text-(--commerce-text-secondary)">
            상품을 불러오지 못했습니다. 잠시 후 다시 시도해주세요.
          </div>
        ) : (
          <ProductGrid
            products={products as Product[]}
            columnsClassName="grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
            // Figma(Home `3:677`) 기준 카드 간격은 24px(가로), 섹션 여백은 더 넉넉한 편
            // 세로가 너무 붙어 보이면 row-gap을 조금 키운다.
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
        )}
      </section>
    </div>
  );
}
