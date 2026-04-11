"use client";

import { cn } from "@/components/ui";
import type { ReactNode } from "react";
import { useEffect, useId, useState } from "react";

export type ProductDetailTabId = "additional-info" | "reviews";

export type ProductDetailTabsProps = {
  defaultTab?: ProductDetailTabId;
  additionalInfoContent: ReactNode;
  reviewsContent: ReactNode;
  className?: string;
};

const TABS: { id: ProductDetailTabId; label: string }[] = [
  { id: "additional-info", label: "Additional info" },
  { id: "reviews", label: "Reviews" },
];

export function ProductDetailTabs({
  defaultTab = "additional-info",
  additionalInfoContent,
  reviewsContent,
  className,
}: ProductDetailTabsProps) {
  const baseId = useId();
  const [activeTab, setActiveTab] = useState<ProductDetailTabId>(defaultTab);

  useEffect(() => {
    setActiveTab(defaultTab);
  }, [defaultTab]);

  return (
    <div className={cn("w-full", className)}>
      <div
        role="tablist"
        aria-label="Product detail tabs"
        className="flex flex-wrap items-end gap-x-2 border-b border-(--commerce-border-subtle)"
      >
        {TABS.map((tab) => {
          const selected = activeTab === tab.id;
          const tabId = `${baseId}-${tab.id}`;
          const panelId = `${baseId}-panel-${tab.id}`;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              id={tabId}
              aria-selected={selected}
              aria-controls={panelId}
              tabIndex={selected ? 0 : -1}
              className={cn(
                "relative -mb-px shrink-0 border-b-2 px-5 py-3 text-base font-medium transition-colors duration-200 ease-out sm:px-6 sm:py-3.5",
                "focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-(--commerce-semantic-info)",
                selected
                  ? "border-(--commerce-primary-main) text-(--commerce-text-primary)"
                  : "border-transparent text-(--commerce-text-tertiary) hover:text-(--commerce-text-secondary)",
              )}
              style={{ fontFamily: "var(--commerce-font-body)" }}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className="inline-flex items-center justify-center whitespace-nowrap">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>

      <div className="min-h-[120px] pt-8 pb-2">
        <div
          id={`${baseId}-panel-additional-info`}
          role="tabpanel"
          aria-labelledby={`${baseId}-additional-info`}
          hidden={activeTab !== "additional-info"}
          className={cn(
            "text-base leading-[26px] text-(--commerce-text-primary)",
            activeTab !== "additional-info" && "hidden",
          )}
          style={{ fontFamily: "var(--commerce-font-body)" }}
        >
          {additionalInfoContent}
        </div>
        <div
          id={`${baseId}-panel-reviews`}
          role="tabpanel"
          aria-labelledby={`${baseId}-reviews`}
          hidden={activeTab !== "reviews"}
          className={cn(
            "text-base leading-[26px] text-(--commerce-text-primary)",
            activeTab !== "reviews" && "hidden",
          )}
          style={{ fontFamily: "var(--commerce-font-body)" }}
        >
          {reviewsContent}
        </div>
      </div>
    </div>
  );
}
