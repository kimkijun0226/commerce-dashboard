"use client";

import { Button } from "@/components/ui";

export default function ProductDetailError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto max-w-[1120px] px-4 py-16 sm:px-8">
      <h2 className="text-[20px] font-semibold leading-8 text-(--commerce-text-primary)">
        상품 정보를 불러오지 못했어요
      </h2>
      <p className="mt-2 text-(--commerce-text-secondary)">
        {error?.message || "잠시 후 다시 시도해 주세요."}
      </p>
      <div className="mt-6 flex gap-3">
        <Button type="button" variant="primary" onClick={() => reset()}>
          다시 시도
        </Button>
        <Button type="button" variant="secondary" onClick={() => history.back()}>
          이전으로
        </Button>
      </div>
    </div>
  );
}

