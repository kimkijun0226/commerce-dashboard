import type { Product } from "@/components/commerce/types";
import { cn } from "@/components/ui";
import { ProductCard } from "../ProductCard/ProductCard";
import type { ReactNode } from "react";

export type ProductGridProps = {
  products: Product[];
  columnsClassName?: string;
  gapClassName?: string;
  renderItem?: (product: Product) => ReactNode;
  emptyState?: ReactNode;
  loading?: boolean;
  className?: string;
};

export function ProductGrid({
  products,
  columnsClassName = "grid-cols-2 md:grid-cols-3 lg:grid-cols-4",
  gapClassName = "gap-6",
  renderItem,
  emptyState,
  loading,
  className,
}: ProductGridProps) {
  if (loading) {
    return (
      <ul
        className={cn("grid", columnsClassName, gapClassName, className)}
        aria-busy
        aria-label="상품 목록 로딩 중"
      >
        {Array.from({ length: 8 }, (_, i) => (
          <li key={i} className="animate-pulse">
            <div className="aspect-[262/349] w-full rounded-lg bg-[var(--commerce-background-light)]" />
            <div className="mt-4 h-4 w-3/4 rounded bg-[var(--commerce-background-elevated)]" />
            <div className="mt-2 h-4 w-1/2 rounded bg-[var(--commerce-background-elevated)]" />
          </li>
        ))}
      </ul>
    );
  }

  if (products.length === 0) {
    return (
      <div className="py-12 text-center text-[var(--commerce-text-secondary)]">
        {emptyState ?? "표시할 상품이 없습니다."}
      </div>
    );
  }

  return (
    <ul className={cn("grid", columnsClassName, gapClassName, className)}>
      {products.map((p) => (
        <li key={p.id}>
          {renderItem ? (
            renderItem(p)
          ) : (
            <ProductCard product={p} />
          )}
        </li>
      ))}
    </ul>
  );
}
