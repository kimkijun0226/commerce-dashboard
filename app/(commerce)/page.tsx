"use client";

import { useProductsQuery } from "@/features/products/api/useProductsQuery";

export default function CommercePage() {
  const { data, isLoading, isError, error, refetch } = useProductsQuery({
    limit: 20,
  });

  return (
    <div>
      <h1>커머스 홈</h1>
      <p>커머스 메인 페이지에서 상품 목록을 React Query로 호출합니다.</p>

      {isLoading ? <div>로딩 중...</div> : null}

      {isError ? (
        <div>
          <div>오류 발생: {error?.message}</div>
          <button type="button" onClick={() => refetch()}>
            다시 시도
          </button>
        </div>
      ) : null}

      <pre
        style={{
          marginTop: 16,
          padding: 12,
          background: "#0b1020",
          color: "#e6e6e6",
          borderRadius: 8,
          overflowX: "auto",
        }}
      >
        {JSON.stringify(data ?? [], null, 2)}
      </pre>
    </div>
  );
}
