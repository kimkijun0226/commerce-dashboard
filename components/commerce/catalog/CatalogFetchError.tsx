import { cn } from "@/components/ui";

export type CatalogFetchErrorProps = {
  className?: string;
};

export function CatalogFetchError({ className }: CatalogFetchErrorProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-(--commerce-border-subtle) bg-(--commerce-background-default) p-6 text-(--commerce-text-secondary)",
        className,
      )}
      role="alert"
    >
      상품을 불러오지 못했습니다. 잠시 후 다시 시도해주세요.
    </div>
  );
}
