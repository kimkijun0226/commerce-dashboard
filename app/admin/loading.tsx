export default function AdminLoading() {
  return (
    <div
      aria-label="관리 데이터 로딩 중"
      role="status"
      className="space-y-6 motion-safe:animate-pulse"
    >
      <div className="h-8 w-52 bg-gray-200" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-28 border border-gray-200 bg-white" />
        ))}
      </div>
      <div className="h-64 border border-gray-200 bg-white" />
    </div>
  );
}
