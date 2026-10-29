import { LoadingSkeletonGrid } from "@/components/commerce/ProductGrid/LoadingSkeletonGrid";

export default function CommerceLoading() {
  return (
    <div className="mx-auto max-w-[1800px] px-4 py-6 sm:px-6 lg:px-8">
      <header aria-hidden className="mb-6 border-b border-[#e8ebed] pb-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[10px] font-semibold tracking-[0.2em] text-[#949ca3]">THE COLLECTION</p>
            <h1 className="mt-1.5 text-2xl font-bold tracking-[-0.8px] text-[#141718] sm:text-[28px]">상품 둘러보기</h1>
          </div>
          <div className="h-[52px] w-full rounded-xl bg-[#f4f5f6] motion-safe:animate-pulse sm:max-w-[420px]" />
        </div>
        <div className="mt-5 flex flex-wrap items-center gap-2 pb-1 motion-safe:animate-pulse">
          {[76, 80, 80, 80, 80, 92, 80].map((width, i) => (
            <div key={i} style={{ width }} className="h-10 shrink-0 rounded-full bg-[#f4f5f6]" />
          ))}
        </div>
      </header>
      <div aria-hidden className="mb-6 flex h-7 items-center gap-2 motion-safe:animate-pulse">
        <div className="h-5 w-20 rounded bg-[#e8ebed]" />
        <div className="h-3 w-10 rounded bg-[#f0f2f4]" />
      </div>
      <LoadingSkeletonGrid />
    </div>
  );
}
