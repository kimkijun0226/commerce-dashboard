"use client";
export default function AdminError({ reset }: { reset: () => void }) {
  return (
    <div role="alert" className="border border-gray-200 bg-white p-8">
      <h1 className="text-xl font-semibold">
        관리 데이터를 불러오지 못했습니다
      </h1>
      <p className="mt-3 text-sm text-gray-500">
        연결 상태를 확인하고 다시 시도해 주세요.
      </p>
      <button
        onClick={reset}
        className="mt-5 bg-black px-5 py-2 text-sm text-white"
      >
        다시 시도
      </button>
    </div>
  );
}
