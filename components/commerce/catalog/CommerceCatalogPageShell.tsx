import { cn } from "@/components/ui";
import type { ReactNode } from "react";

export type CommerceCatalogPageShellProps = {
  title: string;
  "aria-label"?: string;
  children: ReactNode;
  className?: string;
};

export function CommerceCatalogPageShell({
  title,
  "aria-label": ariaLabel,
  children,
  className,
}: CommerceCatalogPageShellProps) {
  return (
    <div
      className={cn(
        "mx-auto max-w-[1440px] px-4 py-10 sm:px-[160px]",
        className,
      )}
    >
      <section aria-label={ariaLabel ?? title}>
        <header className="mb-12 flex items-center justify-center gap-4">
          <h1
            className="text-[28px] font-medium leading-7 text-(--commerce-text-primary)"
            style={{ fontFamily: "var(--commerce-font-heading)" }}
          >
            {title}
          </h1>
        </header>
        {children}
      </section>
    </div>
  );
}
