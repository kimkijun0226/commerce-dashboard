"use client";

import { cn } from "@/components/ui";
import type { ReactNode } from "react";
import {
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

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
  const activeTabRef = useRef(activeTab);
  activeTabRef.current = activeTab;

  const tabListRef = useRef<HTMLDivElement>(null);
  const tabBtnRefs = useRef<
    Partial<Record<ProductDetailTabId, HTMLButtonElement | null>>
  >({});
  const [indicator, setIndicator] = useState({ left: 0, width: 0 });

  useEffect(() => {
    setActiveTab(defaultTab);
  }, [defaultTab]);

  const measureIndicator = () => {
    const list = tabListRef.current;
    const tab = activeTabRef.current;
    const btn = tabBtnRefs.current[tab];
    if (!list || !btn) return;
    const lr = list.getBoundingClientRect();
    const br = btn.getBoundingClientRect();
    setIndicator({ left: br.left - lr.left, width: br.width });
  };

  useLayoutEffect(() => {
    measureIndicator();
  }, [activeTab]);

  useLayoutEffect(() => {
    const list = tabListRef.current;
    if (!list || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(() => measureIndicator());
    ro.observe(list);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const onResize = () => measureIndicator();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return (
    <div className={cn("w-full", className)}>
      <div className="border-b border-[#e8ecef]">
        <div
          ref={tabListRef}
          role="tablist"
          aria-label="Product detail tabs"
          className="relative flex flex-wrap items-end gap-x-10 sm:gap-x-16 md:gap-x-20"
        >
          <span
            className={cn(
              "pointer-events-none absolute -bottom-px z-2 h-1 rounded-full bg-[#141718]",
              "transition-[left,width] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]",
              "motion-reduce:transition-none",
            )}
            style={{ left: indicator.left, width: indicator.width }}
            aria-hidden
          />
          {TABS.map((tab) => {
            const selected = activeTab === tab.id;
            const tabId = `${baseId}-${tab.id}`;
            const panelId = `${baseId}-panel-${tab.id}`;
            return (
              <button
                key={tab.id}
                ref={(el) => {
                  tabBtnRefs.current[tab.id] = el;
                }}
                type="button"
                role="tab"
                id={tabId}
                aria-selected={selected}
                aria-controls={panelId}
                tabIndex={selected ? 0 : -1}
                className={cn(
                  "relative z-1 pb-3 text-left text-[18px] font-medium tracking-[-0.4px]",
                  "transition-[color,transform] duration-300 ease-out",
                  "motion-reduce:transition-none",
                  "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-(--commerce-semantic-info)",
                  "active:scale-[0.99] motion-reduce:active:scale-100",
                  selected
                    ? "text-[#141718]"
                    : "text-[#6c7275] hover:text-[#141718]",
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
      </div>

      <div className="relative min-h-[120px] w-full overflow-hidden pt-12 pb-2">
        <div
          className={cn(
            "flex w-[200%] will-change-transform",
            "transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]",
            "motion-reduce:transition-none",
          )}
          style={{
            transform:
              activeTab === "additional-info"
                ? "translateX(0)"
                : "translateX(-50%)",
          }}
        >
          <div
            id={`${baseId}-panel-additional-info`}
            role="tabpanel"
            aria-labelledby={`${baseId}-additional-info`}
            aria-hidden={activeTab !== "additional-info"}
            className="w-1/2 shrink-0 pr-3 sm:pr-5"
          >
            {additionalInfoContent}
          </div>
          <div
            id={`${baseId}-panel-reviews`}
            role="tabpanel"
            aria-labelledby={`${baseId}-reviews`}
            aria-hidden={activeTab !== "reviews"}
            className="w-1/2 shrink-0 pl-3 sm:pl-5"
          >
            {reviewsContent}
          </div>
        </div>
      </div>
    </div>
  );
}
