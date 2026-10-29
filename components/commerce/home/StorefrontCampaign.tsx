"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { FiArrowRight, FiChevronLeft, FiChevronRight, FiPause, FiPlay } from "react-icons/fi";
import { shouldBypassImageOptimization } from "@/commons/utils/imageOptimization";
import { STOREFRONTS, storeProductUrl, type StoreKey } from "@/lib/catalog/storefront";
import type { Product } from "@/components/commerce/types";

const EDITS: Record<StoreKey, readonly [string, string][]> = {
  fashion: [
    ["매일 입는 옷에도, 나다운 취향", "가장 가까운 일상부터 새롭게"],
    ["오늘의 분위기를 입다", "마음에 드는 한 벌로 시작하는 하루"],
    ["편안함이 만드는 좋은 하루", "오래 함께하고 싶은 데일리 웨어"],
    ["가볍게 걸쳐도 충분하게", "일상의 장면을 채우는 스타일"],
    ["옷장 속 새로운 발견", "익숙한 옷에 더하는 작은 변화"],
    ["나만의 속도로, 나만의 스타일", "유행보다 오래 남는 취향을 찾아서"],
    ["함께 입을수록 더 좋은", "자연스럽게 어우러지는 옷의 조합"],
    ["평범한 날을 조금 특별하게", "오늘 손이 가는 한 벌을 만나보세요"],
    ["주말에도 나답게", "여유로운 하루를 위한 스타일 제안"],
    ["취향이 켜지는 옷장", "오브온에서 만나는 다음 스타일"],
  ],
  beauty: [
    ["나를 돌보는 시간, 오브온 뷰티", "매일의 루틴에 더하는 작은 취향"],
    ["아침을 여는 작은 습관", "오늘의 뷰티 루틴을 만나보세요"],
    ["하루를 채우는 뷰티 취향", "나에게 집중하는 작은 시간"],
    ["화장대 위 새로운 발견", "눈길이 가는 뷰티 아이템 모아보기"],
    ["매일 마주하는 나의 루틴", "나에게 맞는 제품을 천천히 찾아보세요"],
    ["작은 용기 안에 담긴 취향", "일상 가까이에 두고 싶은 뷰티"],
    ["오늘도 나를 아끼는 선택", "나만의 뷰티 시간을 채워보세요"],
    ["가까이 두고 싶은 뷰티", "손이 가는 아이템을 발견하는 즐거움"],
    ["일상에 더하는 뷰티 한 조각", "새롭게 만나는 오브온 뷰티 셀렉션"],
    ["나를 위한 작은 순간", "취향이 켜지는 나만의 화장대"],
  ],
  home: [
    ["머무는 공간에, 나다운 온기", "오브온 홈에서 시작하는 공간의 변화"],
    ["좋아하는 물건과 사는 일", "매일의 풍경이 되는 가구를 만나보세요"],
    ["집 안의 작은 쉼표", "여유를 두고 고르는 나의 가구"],
    ["공간을 채우는 나의 취향", "하나씩 완성해 가는 우리 집"],
    ["오래 바라보고 싶은 장면", "일상에 자연스럽게 스며드는 디자인"],
    ["나만의 자리를 만들다", "머물고 싶은 공간을 위한 제안"],
    ["가구 하나로 달라지는 풍경", "익숙한 공간에 새로운 표정을"],
    ["작은 공간에도 취향은 충분히", "나의 생활에 어울리는 가구 찾기"],
    ["집에서 보내는 좋은 시간", "매일 함께할 물건을 골라보세요"],
    ["취향이 켜지는 우리 집", "오브온 홈의 가구 셀렉션"],
  ],
};

export function StorefrontCampaign({ department, products }: { department: StoreKey; products: Product[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [interacting, setInteracting] = useState(false);
  const edits = EDITS[department];
  const move = (step: number) => setIndex((current) => (current + step + edits.length) % edits.length);

  useEffect(() => {
    if (paused || interacting || products.length === 0 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(() => {
      if (!document.hidden) setIndex((current) => (current + 1) % edits.length);
    }, 5500);
    return () => window.clearInterval(timer);
  }, [paused, interacting, products.length, edits.length]);

  if (!products.length) return null;
  const product = products[index % products.length];
  const [title, description] = edits[index];
  return (
    <aside aria-label={`${STOREFRONTS[department].name} 오브온 광고`} aria-roledescription="캐러셀"
      onMouseEnter={() => setInteracting(true)} onMouseLeave={() => setInteracting(false)}
      onFocusCapture={() => setInteracting(true)} onBlurCapture={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setInteracting(false); }}
      className="relative mb-8 overflow-hidden rounded-[3px] border border-(--commerce-border-subtle)" style={{ background: "var(--store-hero)" }}>
      <Link href={storeProductUrl(product.id, department)} className="group grid min-h-[240px] grid-cols-[1.1fr_1fr] items-center sm:min-h-[280px] sm:grid-cols-[1.3fr_1fr]">
        <div className="relative z-10 py-7 pl-5 pr-2 pb-16 sm:pl-10 lg:pl-14">
          <p className="text-[9px] tracking-[0.22em] text-(--commerce-primary-main) sm:text-xs">OVEON · {STOREFRONTS[department].name} EDIT</p>
          <h2 className="mt-3 max-w-xl text-xl font-medium leading-snug tracking-[-0.05em] text-(--commerce-text-primary) sm:text-3xl lg:text-4xl">{title}</h2>
          <p className="mt-3 hidden text-sm text-(--commerce-text-secondary) sm:block">{description}</p>
          <span className="mt-5 inline-flex items-center gap-2 text-[11px] font-medium sm:text-sm">상품 만나보기 <FiArrowRight aria-hidden className="transition-transform duration-150 group-hover:translate-x-1" /></span>
        </div>
        <div className="relative h-full min-h-[240px] overflow-hidden bg-white/35 sm:min-h-[280px]">
          <Image key={product.imageUrl} src={product.imageUrl} alt={product.name} fill sizes="(max-width: 639px) 46vw, (max-width: 1799px) 42vw, 740px" quality={60}
            unoptimized={shouldBypassImageOptimization(product.imageUrl)} className="object-contain p-4 sm:p-6" />
        </div>
      </Link>
      <div className="absolute bottom-3 left-5 z-20 flex items-center gap-1 bg-white/90 px-1 py-1 sm:left-10 lg:left-14">
        <button type="button" aria-label="이전 광고" onClick={() => move(-1)} className="grid size-8 place-items-center hover:bg-black/5"><FiChevronLeft aria-hidden /></button>
        <span className="min-w-12 text-center text-[11px] tabular-nums" aria-live={paused || interacting ? "polite" : "off"}>{index + 1} / {edits.length}</span>
        <button type="button" aria-label="다음 광고" onClick={() => move(1)} className="grid size-8 place-items-center hover:bg-black/5"><FiChevronRight aria-hidden /></button>
        <button type="button" aria-label={paused ? "광고 자동 재생" : "광고 자동 재생 정지"} onClick={() => setPaused(!paused)} className="grid size-8 place-items-center border-l border-black/10 hover:bg-black/5">{paused ? <FiPlay aria-hidden /> : <FiPause aria-hidden />}</button>
      </div>
    </aside>
  );
}
