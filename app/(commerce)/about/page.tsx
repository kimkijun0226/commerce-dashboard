import Image from "next/image";
import Link from "next/link";
import { STOREFRONTS } from "@/lib/catalog/storefront";
export const metadata = { title: "오브온의 이야기 | 취향이 켜지는 순간" };
export default function AboutPage() {
  return <article className="mx-auto max-w-4xl px-6 py-16 sm:py-24">
    <Image src="/brand/oveon-logo.svg" alt="OVEON 오브온" width={250} height={56} className="mb-12 h-auto w-44" />
    <p className="text-xs tracking-[0.2em] text-(--commerce-text-secondary)">OUR STORY</p>
    <h1 className="mt-4 text-3xl font-semibold leading-snug sm:text-5xl">나의 취향으로<br />일상을 켜다.</h1>
    <div className="mt-10 max-w-2xl space-y-6 text-sm leading-8 text-(--commerce-text-secondary) sm:text-base">
      <p>우리는 매일 무언가를 입고, 나를 돌보고, 나의 공간으로 돌아옵니다. 오브온은 그 평범한 순간에 나만의 취향을 더하는 곳입니다.</p>
      <p>오늘의 나를 표현하는 옷, 나를 위한 작은 뷰티 루틴, 마음이 놓이는 집 안의 한 장면까지. 남들이 정해 놓은 모습보다 내가 좋아하는 것을 발견하고, 그 선택들이 모여 온전히 나다운 일상이 되도록.</p>
      <p>오브온은 물건을 고르는 곳을 넘어, 나의 취향으로 일상을 켜는 곳을 지향합니다.</p>
    </div>
    <section className="mt-14 rounded-2xl bg-[#f4f2ed] p-7 sm:p-10">
      <h2 className="text-xl font-semibold">오브온이라는 이름에 담은 마음</h2>
      <p className="mt-5 text-sm leading-8 text-[#73766e]">‘오브’는 취향이 담긴 물건인 오브제를 떠올리게 하는 소리입니다. ‘온’은 취향을 켜는 ON, 온전히 나다운 일상, 그리고 공간과 마음에 더해지는 온기를 의미합니다. 기존 단어의 사전적 어원이 아닌, 오브온이라는 이름에 우리가 부여한 브랜드의 의미입니다.</p>
    </section>
    <div className="mt-10 grid gap-4 sm:grid-cols-3">{Object.values(STOREFRONTS).map(store=><Link href={store.path} key={store.key} className="rounded-xl border border-(--commerce-border-subtle) p-6 hover:bg-(--commerce-background-light)"><span className="text-xs text-(--commerce-text-secondary)">{store.eyebrow}</span><h2 className="mt-3 font-semibold">오브온 · {store.name}</h2><p className="mt-2 text-xs leading-6 text-(--commerce-text-secondary)">{store.description}</p></Link>)}</div>
  </article>;
}
