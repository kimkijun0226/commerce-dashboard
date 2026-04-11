import type { ProductDetail } from "@/commons/types/product";
import { cn } from "@/components/ui";

const DEFAULT_CATEGORIES = "—";

export type ProductDetailCategorySectionProps = {
  product: ProductDetail;
  className?: string;
};

export function ProductDetailCategorySection({
  product,
  className,
}: ProductDetailCategorySectionProps) {
  const categoryLine =
    product.categories && product.categories.length > 0
      ? product.categories.map((c) => c.name).join(", ")
      : DEFAULT_CATEGORIES;

  return (
    <div
      className={cn(
        "flex flex-col gap-2 border-t border-(--commerce-border-subtle) pt-6",
        className,
      )}
    >
      <span
        className="text-[12px] font-normal uppercase leading-5 text-(--commerce-text-secondary)"
        style={{ fontFamily: "var(--commerce-font-body)" }}
      >
        CATEGORY
      </span>
      <span
        className="text-[12px] font-normal leading-5 text-(--commerce-text-primary)"
        style={{ fontFamily: "var(--commerce-font-body)" }}
      >
        {categoryLine}
      </span>
    </div>
  );
}
