"use client";

import Image from "next/image";
import { catalogFilterUrl, defaultCampaigns, type CampaignBanner, type CampaignFilter } from "@/lib/catalog/campaigns";
import { useEffect, useMemo, useState } from "react";
import { FiArrowRight, FiChevronLeft, FiChevronRight, FiPause, FiPlay } from "react-icons/fi";
import { shouldBypassImageOptimization } from "@/commons/utils/imageOptimization";
import { canPrefetchImages } from "@/commons/utils/productImage";
import { getImageProps } from "next/image";
import { STOREFRONTS, type StoreKey } from "@/lib/catalog/storefront";


export function StorefrontCampaign({ department, campaigns, onSelect }: { department: StoreKey; campaigns?: CampaignBanner[]; onSelect: (filter: CampaignFilter) => void }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [interacting, setInteracting] = useState(false);
  const edits = useMemo(() => (campaigns ?? defaultCampaigns(department)).filter(banner => banner.enabled), [campaigns, department]);
  const move = (step: number) => setIndex((current) => (current + step + edits.length) % edits.length);

  useEffect(() => {
    if (!edits.length || paused || interacting || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(() => {
      if (!document.hidden) setIndex((current) => (current + 1) % edits.length);
    }, 5500);
    return () => window.clearInterval(timer);
  }, [paused, interacting, edits.length]);

  useEffect(() => {
    if (!edits.length || !canPrefetchImages()) return;
    const nextImage = edits[(index + 1) % edits.length].imageUrl;
    const { props } = getImageProps({ src: nextImage, unoptimized: shouldBypassImageOptimization(nextImage), alt: "", fill: true, quality: 75, sizes: "(max-width: 1799px) 100vw, 1736px" });
    const image = new window.Image();
    image.fetchPriority = "low";
    image.sizes = props.sizes ?? "";
    image.srcset = props.srcSet ?? "";
    image.src = props.src;
  }, [department, index, edits]);

  if (!edits.length) return null;
  const slide = edits[index % edits.length];
  const { title, description } = slide;
  const target = { category: slide.category, q: slide.q };
  return (
    <header aria-label={`${STOREFRONTS[department].name} 오브온 광고`} aria-roledescription="캐러셀"
      onMouseEnter={() => setInteracting(true)} onMouseLeave={() => setInteracting(false)}
      onFocusCapture={() => setInteracting(true)} onBlurCapture={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setInteracting(false); }}
      className="relative mb-5 isolate h-[400px] overflow-hidden rounded-[3px] bg-[#282925] text-white sm:h-[420px] lg:h-[480px]">
      <Image key={`${department}-${index}`} src={slide.imageUrl} unoptimized={shouldBypassImageOptimization(slide.imageUrl)} alt={`${STOREFRONTS[department].name} 오브온 브랜드 캠페인 화보`} fill
        sizes="(max-width: 1799px) 100vw, 1736px" quality={75} preload={index === 0} loading={index === 0 ? undefined : "eager"}
        className={department === "fashion" ? "object-cover object-[65%_center] sm:object-top" : "object-cover object-[65%_center] sm:object-center"} />
      <div aria-hidden className="absolute inset-0 bg-linear-to-t from-black/75 via-black/10 to-black/5 sm:bg-linear-to-r sm:from-black/65 sm:via-black/15 sm:to-transparent" />
      <a href={catalogFilterUrl(department, target, true)} onClick={(event) => { if (event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey) { event.preventDefault(); onSelect(target); } }} className="absolute inset-0 z-10" aria-label={`${title} 상품 보기`} />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 px-6 pb-20 pt-8 sm:inset-y-0 sm:flex sm:max-w-[75%] sm:flex-col sm:justify-center sm:px-10 sm:pb-10 lg:px-14">
        <p className="text-[10px] font-medium tracking-[0.24em] text-white/85 sm:text-xs">{STOREFRONTS[department].eyebrow} / CAMPAIGN {String(index + 1).padStart(2, "0")}</p>
        <h1 className="mt-4 max-w-[660px] text-[30px] font-bold leading-[1.17] tracking-[-0.055em] text-balance sm:text-[42px] lg:text-[56px]">{title}</h1>
        <p className="mt-3 max-w-md text-xs leading-6 text-white/80 sm:mt-5 sm:text-sm">{description}</p>
        <span className="mt-5 inline-flex w-fit items-center gap-3 border-b border-white/70 pb-1.5 text-xs font-medium sm:mt-7 sm:text-sm">컬렉션 둘러보기 <FiArrowRight aria-hidden /></span>
      </div>
      <div className="pointer-events-none absolute bottom-5 left-6 right-6 z-20 flex items-end justify-between sm:left-10 sm:right-8 lg:left-14">
        <span className="text-[9px] tracking-[0.18em] text-white/65">OVEON<span className="hidden sm:inline"> — 취향이 켜지는 순간</span></span>
        <div className="pointer-events-auto flex items-center gap-0.5 bg-black/30 px-1 py-0.5 backdrop-blur-sm">
          <button type="button" aria-label="이전 광고" onClick={() => move(-1)} className="grid size-8 place-items-center hover:bg-white/15"><FiChevronLeft aria-hidden /></button>
          <span className="min-w-10 text-center text-[10px] tabular-nums" aria-live={paused || interacting ? "polite" : "off"}>{String(index + 1).padStart(2, "0")} / {edits.length}</span>
          <button type="button" aria-label="다음 광고" onClick={() => move(1)} className="grid size-8 place-items-center hover:bg-white/15"><FiChevronRight aria-hidden /></button>
          <button type="button" aria-label={paused ? "광고 자동 재생" : "광고 자동 재생 정지"} onClick={() => setPaused(!paused)} className="grid size-8 place-items-center border-l border-white/20 hover:bg-white/15">{paused ? <FiPlay aria-hidden /> : <FiPause aria-hidden />}</button>
        </div>
      </div>
    </header>
  );
}
