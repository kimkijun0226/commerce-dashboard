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

/** Figma Tabs/Menu (node 48:8004): Inter 18 Medium, lh 32, tracking -0.4px */
const TABS: { id: ProductDetailTabId; label: string }[] = [
  { id: "additional-info", label: "Additional Info" },
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
        className="flex h-8 flex-wrap items-end gap-x-20"
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
                "relative shrink-0 border-b-2 border-transparent pb-0 text-left text-[18px] font-medium tracking-[-0.4px] transition-colors duration-200",
                "focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-(--commerce-semantic-info)",
                selected
                  ? "border-black text-[#121212]"
                  : "text-[#807e7e] hover:text-[#121212]",
              )}
              style={{
                fontFamily: "var(--commerce-font-body)",
                lineHeight: "32px",
              }}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="min-h-[120px] pt-12 pb-2">
        <div
          id={`${baseId}-panel-additional-info`}
          role="tabpanel"
          aria-labelledby={`${baseId}-additional-info`}
          hidden={activeTab !== "additional-info"}
          className={cn(activeTab !== "additional-info" && "hidden")}
        >
          {additionalInfoContent}
        </div>
        <div
          id={`${baseId}-panel-reviews`}
          role="tabpanel"
          aria-labelledby={`${baseId}-reviews`}
          hidden={activeTab !== "reviews"}
          className={cn(activeTab !== "reviews" && "hidden")}
        >
          {reviewsContent}
        </div>
      </div>
    </div>
  );
}
