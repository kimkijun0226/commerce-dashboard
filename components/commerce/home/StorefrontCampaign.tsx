"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { FiArrowRight, FiChevronLeft, FiChevronRight, FiPause, FiPlay } from "react-icons/fi";
import { canPrefetchImages } from "@/commons/utils/productImage";
import { getImageProps } from "next/image";
import { STOREFRONTS, type StoreKey } from "@/lib/catalog/storefront";

const EDITS: Record<StoreKey, readonly [string, string][]> = {
  fashion: [
    ["가디건의 계절", "툭 걸치기 좋은 니트와 가디건"],
    ["니트부터 꺼낼 시간", "단독으로도, 레이어드로도 좋은 한 벌"],
    ["오늘은 자켓", "데님 위에 가볍게 완성하는 아우터 룩"],
    ["자켓 하나면 충분", "티셔츠에 더하는 가장 간단한 스타일링"],
    ["길게 입는 멋", "트렌치부터 롱 코트까지, 아우터 모아보기"],
    ["셔츠는 여유 있게", "넉넉한 실루엣으로 입는 데일리 셔츠"],
    ["힘 빼고 입는 날", "스웨트와 와이드 팬츠로 편하게"],
    ["코트 입을 날을 기다렸어", "차분한 컬러로 준비하는 코트 스타일링"],
    ["가볍게, 코튼", "티셔츠와 팬츠로 맞추는 담백한 룩"],
    ["주말에도 자켓", "격식은 덜고, 여유는 더한 캐주얼 룩"],
  ],
  beauty: [
    ["세럼부터 시작해", "매일의 기초 케어에 더할 세럼·앰플"],
    ["기초에 집중할 시간", "토너부터 크림까지, 스킨케어 모아보기"],
    ["크림을 고르는 기준", "내 피부에 맞춰 살펴보는 보습 케어"],
    ["외출 전, 선케어", "매일 챙기는 루틴의 마지막 단계"],
    ["세안 다음, 토너", "스킨케어의 첫 단계를 골라보세요"],
    ["오늘의 스킨케어 순서", "클렌징부터 차근차근, 기초 루틴 살펴보기"],
    ["입술에도 루틴이 필요해", "가까이 두고 쓰는 데일리 립케어"],
    ["매일 쓰는 기초", "화장대에 채워둘 스킨케어 아이템"],
    ["보습 루틴 다시 보기", "세럼과 크림, 나에게 맞는 조합 찾기"],
    ["마지막은 크림", "기초 루틴을 마무리할 크림 모아보기"],
  ],
  home: [
    ["앉고 싶은 의자", "거실 한쪽을 채울 라운지 체어"],
    ["거실의 중심, 테이블", "소파 앞에 놓기 좋은 낮은 테이블"],
    ["의자부터 바꿔볼까", "다이닝 공간을 완성하는 체어 셀렉션"],
    ["잘 보이는 수납", "정리도 인테리어가 되는 수납장"],
    ["거실에 포인트 하나", "분위기를 바꾸는 라운지 체어"],
    ["작지만 쓸모 있는", "빈자리마다 어울리는 스툴 모아보기"],
    ["거실을 다시 꾸민다면", "테이블과 체어로 시작하는 공간 스타일링"],
    ["집중이 잘되는 자리", "나만의 작업 공간을 위한 데스크와 의자"],
    ["소파 옆 작은 테이블", "손 닿는 곳에 두는 사이드 테이블"],
    ["우리 집 다이닝", "함께 둘 테이블과 의자를 골라보세요"],
  ],
};

export function StorefrontCampaign({ department }: { department: StoreKey }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [interacting, setInteracting] = useState(false);
  const edits = EDITS[department];
  const move = (step: number) => setIndex((current) => (current + step + edits.length) % edits.length);

  useEffect(() => {
    if (paused || interacting || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(() => {
      if (!document.hidden) setIndex((current) => (current + 1) % edits.length);
    }, 5500);
    return () => window.clearInterval(timer);
  }, [paused, interacting, edits.length]);

  useEffect(() => {
    if (!canPrefetchImages()) return;
    const { props } = getImageProps({ src: `/campaigns/editorial/${department}-${((index + 1) % edits.length) + 1}.webp`, alt: "", fill: true, quality: 75, sizes: "(max-width: 1799px) 100vw, 1736px" });
    const image = new window.Image();
    image.fetchPriority = "low";
    image.sizes = props.sizes ?? "";
    image.srcset = props.srcSet ?? "";
    image.src = props.src;
  }, [department, index, edits.length]);

  const [title, description] = edits[index];
  return (
    <header aria-label={`${STOREFRONTS[department].name} 오브온 광고`} aria-roledescription="캐러셀"
      onMouseEnter={() => setInteracting(true)} onMouseLeave={() => setInteracting(false)}
      onFocusCapture={() => setInteracting(true)} onBlurCapture={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setInteracting(false); }}
      className="relative mb-5 isolate h-[400px] overflow-hidden rounded-[3px] bg-[#282925] text-white sm:h-[420px] lg:h-[480px]">
      <Image key={`${department}-${index}`} src={`/campaigns/editorial/${department}-${index + 1}.webp`} alt={`${STOREFRONTS[department].name} 오브온 브랜드 캠페인 화보`} fill
        sizes="(max-width: 1799px) 100vw, 1736px" quality={75} preload={index === 0} loading={index === 0 ? undefined : "eager"}
        className={department === "fashion" ? "object-cover object-[65%_center] sm:object-top" : "object-cover object-[65%_center] sm:object-center"} />
      <div aria-hidden className="absolute inset-0 bg-linear-to-t from-black/75 via-black/10 to-black/5 sm:bg-linear-to-r sm:from-black/65 sm:via-black/15 sm:to-transparent" />
      <div className="absolute inset-x-0 bottom-0 px-6 pb-20 pt-8 sm:inset-y-0 sm:flex sm:max-w-[75%] sm:flex-col sm:justify-center sm:px-10 sm:pb-10 lg:px-14">
        <p className="text-[10px] font-medium tracking-[0.24em] text-white/85 sm:text-xs">{STOREFRONTS[department].eyebrow} / CAMPAIGN {String(index + 1).padStart(2, "0")}</p>
        <h1 className="mt-4 max-w-[660px] text-[30px] font-bold leading-[1.17] tracking-[-0.055em] text-balance sm:text-[42px] lg:text-[56px]">{title}</h1>
        <p className="mt-3 max-w-md text-xs leading-6 text-white/80 sm:mt-5 sm:text-sm">{description}</p>
        <Link href="#catalog-products" className="mt-5 inline-flex w-fit items-center gap-3 border-b border-white/70 pb-1.5 text-xs font-medium sm:mt-7 sm:text-sm">컬렉션 둘러보기 <FiArrowRight aria-hidden /></Link>
      </div>
      <div className="absolute bottom-5 left-6 right-6 flex items-end justify-between sm:left-10 sm:right-8 lg:left-14">
        <span className="text-[9px] tracking-[0.18em] text-white/65">OVEON<span className="hidden sm:inline"> — 취향이 켜지는 순간</span></span>
        <div className="flex items-center gap-0.5 bg-black/30 px-1 py-0.5 backdrop-blur-sm">
          <button type="button" aria-label="이전 광고" onClick={() => move(-1)} className="grid size-8 place-items-center hover:bg-white/15"><FiChevronLeft aria-hidden /></button>
          <span className="min-w-10 text-center text-[10px] tabular-nums" aria-live={paused || interacting ? "polite" : "off"}>{String(index + 1).padStart(2, "0")} / {edits.length}</span>
          <button type="button" aria-label="다음 광고" onClick={() => move(1)} className="grid size-8 place-items-center hover:bg-white/15"><FiChevronRight aria-hidden /></button>
          <button type="button" aria-label={paused ? "광고 자동 재생" : "광고 자동 재생 정지"} onClick={() => setPaused(!paused)} className="grid size-8 place-items-center border-l border-white/20 hover:bg-white/15">{paused ? <FiPlay aria-hidden /> : <FiPause aria-hidden />}</button>
        </div>
      </div>
    </header>
  );
}
