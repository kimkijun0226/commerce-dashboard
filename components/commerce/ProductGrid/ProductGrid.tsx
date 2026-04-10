import type { Product } from "@/components/commerce/types";
import { cn } from "@/components/ui";
import { ProductCard } from "../ProductCard/ProductCard";
import { LoadingSkeletonGrid } from "./LoadingSkeletonGrid";
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
      <LoadingSkeletonGrid
        className={className}
        columnsClassName={columnsClassName}
        gapClassName={gapClassName}
      />
    );
  }

  if (products.length === 0) {
    return (
      <div className="py-12 text-center text-(--commerce-text-secondary)">
        {emptyState ?? "표시할 상품이 없습니다."}
      </div>
    );
  }

  return (
    <ul className={cn("grid", columnsClassName, gapClassName, className)}>
      {products.map((p) => (
        <li key={p.id}>
          {renderItem ? renderItem(p) : <ProductCard product={p} />}
        </li>
      ))}
    </ul>
  );
}
