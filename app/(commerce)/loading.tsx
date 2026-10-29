import { LoadingSkeletonGrid } from "@/components/commerce/ProductGrid/LoadingSkeletonGrid";

export default function CommerceLoading() {
  return (
    <div className="mx-auto w-full max-w-[1800px] px-4 py-8 sm:px-6 lg:px-8">
      <div aria-hidden className="mb-8 h-24 animate-pulse rounded-xl bg-gray-100" />
      <LoadingSkeletonGrid columnsClassName="grid-cols-2 min-[480px]:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 2xl:grid-cols-6" />
    </div>
  );
}
