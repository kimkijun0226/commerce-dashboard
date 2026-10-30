"use client";

import { usePathname } from "next/navigation";

export default function AdminLoading() {
  const path = usePathname();
  const overview = path === "/admin" || path === "/admin/live";
  const table = path === "/admin/orders" || path === "/admin/products";
  return (
    <div role="status" aria-label="관리 데이터 로딩 중" className="space-y-6">
      <div aria-hidden className="space-y-3 motion-safe:animate-pulse">
        <div className="h-3 w-24 rounded bg-gray-200" />
        <div className="h-9 w-64 max-w-full rounded bg-gray-200" />
        <div className="h-4 w-80 max-w-full rounded bg-gray-100" />
      </div>
      {(table || path === "/admin") && (
        <div aria-hidden className="admin-panel h-24 motion-safe:animate-pulse">
          <div className="flex gap-4">
            <div className="h-10 w-48 rounded bg-gray-100" />
            <div className="h-10 w-32 rounded bg-gray-100" />
          </div>
        </div>
      )}
      {overview && (
        <div aria-hidden className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: path === "/admin" ? 8 : 4 }, (_, i) => (
            <div
              key={i}
              className="admin-metric-card space-y-4 motion-safe:animate-pulse"
            >
              <div className="h-4 w-24 rounded bg-gray-100" />
              <div className="h-8 w-36 max-w-full rounded bg-gray-200" />
              <div className="h-3 w-28 rounded bg-gray-100" />
            </div>
          ))}
        </div>
      )}
      {overview ? (
        <div aria-hidden className="grid gap-5 lg:grid-cols-[2fr_1fr]">
          {[0, 1].map((i) => (
            <div key={i} className="admin-panel motion-safe:animate-pulse">
              <div className="h-5 w-32 rounded bg-gray-200" />
              <div className="mt-6 h-64 border-b border-l border-gray-100 bg-linear-to-t from-gray-100/70 to-white" />
            </div>
          ))}
        </div>
      ) : table ? (
        <div
          aria-hidden
          className="admin-panel admin-table-panel overflow-hidden motion-safe:animate-pulse"
        >
          <div className="h-12 bg-gray-100" />
          {Array.from({ length: 8 }, (_, i) => (
            <div
              key={i}
              className="flex h-20 items-center gap-6 border-b border-gray-100 px-6"
            >
              <div className="h-4 w-2/5 rounded bg-gray-100" />
              <div className="h-4 w-1/5 rounded bg-gray-100" />
              <div className="ml-auto h-8 w-20 rounded bg-gray-100" />
            </div>
          ))}
        </div>
      ) : (
        <div
          aria-hidden
          className="admin-panel space-y-7 motion-safe:animate-pulse"
        >
          {Array.from({ length: 6 }, (_, i) => (
            <div key={i} className="space-y-2">
              <div className="h-4 w-24 rounded bg-gray-200" />
              <div className="h-10 max-w-xl rounded bg-gray-100" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
