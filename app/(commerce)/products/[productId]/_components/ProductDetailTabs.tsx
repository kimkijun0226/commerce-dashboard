"use client";

// 상품 상세의 리뷰/디테일 이미지/추가정보 탭을 애니메이션 전환과 함께 보여 줍니다.
import { cn } from "@/components/ui";
import type { ReactNode } from "react";
import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

export type ProductDetailTabId = "product-detail" | "extra-info" | "reviews";

export type ProductDetailTabsProps = {
  defaultTab?: ProductDetailTabId;
  productDetailContent: ReactNode;
  extraInfoContent: ReactNode;
  reviewsContent: ReactNode;
  className?: string;
};

const TABS: { id: ProductDetailTabId; label: string }[] = [
  { id: "reviews", label: "Reviews" },
  { id: "product-detail", label: "Detail Images" },
  { id: "extra-info", label: "Additional Info" },
];

const PANEL_COUNT = TABS.length;

// 탭 헤더와 슬라이드 패널을 함께 관리하는 상품 상세 탭 컨테이너입니다.
export function ProductDetailTabs({
  defaultTab = "reviews",
  productDetailContent,
  extraInfoContent,
  reviewsContent,
  className,
}: ProductDetailTabsProps) {
  const baseId = useId();
  const [activeTab, setActiveTab] = useState<ProductDetailTabId>(defaultTab);

  const tabListRef = useRef<HTMLDivElement>(null);
  const tabBtnRefs = useRef<
    Partial<Record<ProductDetailTabId, HTMLButtonElement | null>>
  >({});
  const [indicator, setIndicator] = useState({ left: 0, width: 0 });

  // 부모 prop이 바뀌면 현재 활성 탭도 동기화합니다.
  useEffect(() => {
    setActiveTab(defaultTab);
  }, [defaultTab]);

  // 활성 탭 버튼 위치를 읽어 하단 인디케이터 길이와 위치를 갱신합니다.
  const measureIndicator = useCallback(() => {
    const list = tabListRef.current;
    const btn = tabBtnRefs.current[activeTab];
    if (!list || !btn) return;
    const lr = list.getBoundingClientRect();
    const br = btn.getBoundingClientRect();
    setIndicator({ left: br.left - lr.left, width: br.width });
  }, [activeTab]);

  useLayoutEffect(() => {
    measureIndicator();
  }, [measureIndicator]);

  useLayoutEffect(() => {
    const list = tabListRef.current;
    if (!list || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(() => measureIndicator());
    ro.observe(list);
    return () => ro.disconnect();
  }, [measureIndicator]);

  useEffect(() => {
    const onResize = () => measureIndicator();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [measureIndicator]);

  const activeIndex = Math.max(
    0,
    TABS.findIndex((t) => t.id === activeTab),
  );

  // 탭 id를 실제 패널 콘텐츠와 매핑해 슬라이드 영역에서 재사용합니다.
  const panelFor: Record<ProductDetailTabId, ReactNode> = {
    "product-detail": productDetailContent,
    "extra-info": extraInfoContent,
    reviews: reviewsContent,
  };

  return (
    <div className={cn("w-full", className)}>
      <div className="border-b border-[#e8ecef]">
        <div
          ref={tabListRef}
          role="tablist"
          aria-label="Product detail tabs"
          className="relative flex flex-wrap items-end gap-x-6 sm:gap-x-10 md:gap-x-14"
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
                  "relative z-1 pb-3 text-left text-[17px] font-medium tracking-[-0.4px] sm:text-[18px]",
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
            "flex will-change-transform",
            "w-[300%] transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]",
            "motion-reduce:transition-none",
          )}
          style={{
            transform: `translateX(-${(activeIndex * 100) / PANEL_COUNT}%)`,
          }}
        >
          {TABS.map((tab) => {
            const panelId = `${baseId}-panel-${tab.id}`;
            const tabId = `${baseId}-${tab.id}`;
            return (
              <div
                key={tab.id}
                id={panelId}
                role="tabpanel"
                aria-labelledby={tabId}
                aria-hidden={activeTab !== tab.id}
                className="w-1/3 shrink-0 px-1 sm:px-3"
              >
                {panelFor[tab.id]}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
