import Image from "next/image";
import Link from "next/link";
import { STOREFRONTS } from "@/lib/catalog/storefront";
export const metadata = {
  title: "RÊVIE 레비의 이야기 | LIVE YOUR DREAM",
  description:
    "상상하던 나, 꿈꾸던 공간이 일상이 되는 곳. 꿈과 삶을 연결하는 RÊVIE의 브랜드 스토리.",
};
export default function AboutPage() {
  return (
    <article className="mx-auto max-w-6xl px-6 py-14 text-[#594639] sm:py-24">
      <header className="max-w-3xl">
        <Image
          src="/brand/revie-logo.svg"
          alt="RÊVIE 레비"
          width={248}
          height={72}
          className="h-auto w-44 sm:w-60"
          priority
        />
        <p className="mt-4 text-[10px] tracking-[0.35em] sm:text-xs">
          LIVE YOUR DREAM
        </p>
        <h1 className="mt-10 text-3xl font-medium leading-relaxed tracking-tight sm:text-5xl sm:leading-snug">
          상상하던 나,
          <br />
          꿈꾸던 공간이 일상이 되는 곳.
        </h1>
      </header>
      <figure className="my-12 border border-[#e6ddd3] bg-[#f4eee7]">
        <Image
          src="/brand/revie-brand-story.png"
          alt="햇살이 드는 아이보리 공간의 RÊVIE 로고와 패션·뷰티·리빙 브랜드 스토리"
          width={1774}
          height={887}
          sizes="(max-width: 1152px) 100vw, 1104px"
          quality={75}
          className="h-auto w-full"
        />
      </figure>
      <section
        aria-label="레비 브랜드 이야기"
        className="max-w-3xl space-y-6 text-sm leading-8 text-[#786b60] sm:text-base sm:leading-9"
      >
        <p>우리는 누구나 마음속에 자신만의 이상적인 모습을 그립니다.</p>
        <p>
          언젠가 입고 싶었던 옷, 나를 더욱 아름답게 만들어주는 작은 습관, 그리고
          오랫동안 꿈꿔왔던 나만의 공간.
        </p>
        <p>
          그 모든 상상은 특별한 순간이 아니라, 매일의 작은 선택에서 시작됩니다.
        </p>
        <p>
          <strong className="font-medium text-[#594639]">RÊVIE(레비)</strong>는
          프랑스어 <em>RÊVE(꿈)</em>와 <em>VIE(삶)</em>를 결합해 탄생한
          이름입니다.
        </p>
        <p>
          꿈과 삶이 하나로 이어진다는 의미처럼, 레비는 당신이 상상하던
          라이프스타일을 현실로 만들어가는 브랜드입니다.
        </p>
      </section>
      <div className="my-14 grid border-y border-[#e6ddd3] sm:grid-cols-3">
        {Object.values(STOREFRONTS).map((store) => (
          <Link
            key={store.key}
            href={store.path}
            className="border-b border-[#e6ddd3] px-4 py-8 transition-colors hover:bg-[#f4eee7] last:border-b-0 sm:border-b-0 sm:border-r sm:last:border-r-0 sm:px-6"
          >
            <span className="text-xs tracking-[0.2em]">
              {store.key === "fashion"
                ? "FASHION"
                : store.key === "beauty"
                  ? "BEAUTY"
                  : "LIVING"}
            </span>
            <h2 className="mt-4 text-lg font-medium">{store.title}</h2>
            <p className="mt-4 text-sm leading-7 text-[#786b60]">
              {store.description}
            </p>
          </Link>
        ))}
      </div>
      <section className="max-w-3xl space-y-6 text-sm leading-8 text-[#786b60] sm:text-base sm:leading-9">
        <p>레비는 옷과 뷰티, 가구와 리빙을 하나의 취향으로 연결합니다.</p>
        <p>
          당신이 선택하는 모든 것이 모여, 상상하던 나와 꿈꾸던 공간을 완성할 수
          있도록.
        </p>
        <p className="pt-6 font-medium tracking-wider text-[#594639]">
          RÊVIE — LIVE YOUR DREAM.
        </p>
        <p className="italic">상상하던 일상을, 당신의 현실로.</p>
      </section>
    </article>
  );
}
