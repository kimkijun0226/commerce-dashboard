import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { checkAdminAccess } from "@/lib/auth/admin";
import { createClient } from "@/lib/supabase/server";
import { buildCatalogSearchFilter } from "@/lib/catalog/filters";
import { STOREFRONTS, parseStoreKey } from "@/lib/catalog/storefront";
import { getProductDisplayName } from "@/commons/utils/productDisplay";
import { AdminStatusBadge } from "@/components/admin";
export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  if (!(await checkAdminAccess())) notFound();
  const params = await searchParams;
  const page = Math.max(1, Math.floor(Number(params.page) || 1));
  const q = (params.q ?? "").trim().slice(0, 200);
  const department =
    params.department &&
    ["fashion", "beauty", "home"].includes(params.department)
      ? params.department
      : "";
  const supabase = await createClient();
  let query = supabase
    .from("products")
    .select(
      "id,name,department,price,sale_price,image_url,status,categories,search_keywords",
      { count: "exact" },
    );
  if (q) query = query.or(buildCatalogSearchFilter(q));
  if (department) query = query.eq("department", parseStoreKey(department));
  const { data, count, error } = await query
    .order("created_at", { ascending: false })
    .order("id", { ascending: false })
    .range((page - 1) * 20, page * 20 - 1);
  if (error) throw new Error(`상품 조회 실패: ${error.message}`);
  const pages = Math.max(1, Math.ceil((count ?? 0) / 20));
  const href = (p: number) =>
    `/admin/products?${new URLSearchParams({ page: String(p), q, department })}`;
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">상품 관리</h1>
          <p className="mt-2 text-sm text-gray-500">
            총 {(count ?? 0).toLocaleString()}개 · 상품을 선택해 이미지, 옵션,
            검색 태그를 수정하세요.
          </p>
        </div>
        <Link
          href="/admin/products/new"
          className="shrink-0 bg-black px-4 py-3 text-sm text-white"
        >
          상품 등록
        </Link>
      </div>
      <form className="flex flex-wrap gap-2 border border-gray-200 bg-white p-4">
        <input
          name="q"
          defaultValue={q}
          aria-label="관리 상품 검색"
          placeholder="상품명 또는 #검색태그"
          className="min-w-0 flex-1 border border-gray-200 px-3 py-2 text-sm"
        />
        <select
          name="department"
          defaultValue={department}
          aria-label="매장 필터"
          className="border border-gray-200 px-3 py-2 text-sm"
        >
          <option value="">전체 매장</option>
          {Object.values(STOREFRONTS).map((s) => (
            <option key={s.key} value={s.key}>
              {s.name}
            </option>
          ))}
        </select>
        <button className="bg-gray-800 px-4 py-2 text-sm text-white">
          검색
        </button>
      </form>
      <div className="overflow-x-auto border border-gray-200 bg-white">
        <table className="w-full min-w-[650px] text-left text-sm">
          <thead className="border-b bg-gray-50 text-xs text-gray-500">
            <tr>
              <th className="p-4">상품</th>
              <th>매장 / 카테고리</th>
              <th>판매가</th>
              <th>상태</th>
              <th>태그</th>
            </tr>
          </thead>
          <tbody>
            {data?.map((p) => (
              <tr key={p.id} className="border-b border-gray-100">
                <td className="p-4">
                  <Link
                    href={`/admin/products/${p.id}`}
                    className="flex max-w-sm items-center gap-3 hover:underline"
                  >
                    {p.image_url ? (
                      <Image
                        src={p.image_url}
                        alt=""
                        width={48}
                        height={60}
                        unoptimized
                        className="h-15 w-12 shrink-0 object-cover"
                      />
                    ) : null}
                    <span>{getProductDisplayName(p.name)}</span>
                  </Link>
                </td>
                <td className="pr-3 text-xs text-gray-500">
                  {STOREFRONTS[parseStoreKey(p.department)].name}
                  <br />
                  {p.categories?.join(" · ")}
                </td>
                <td className="whitespace-nowrap pr-3">
                  {(p.sale_price ?? p.price).toLocaleString()}원
                </td>
                <td className="pr-3">
                  <AdminStatusBadge
                    variant={
                      p.status === "registered"
                        ? "success"
                        : p.status === "sold_out"
                          ? "warning"
                          : "neutral"
                    }
                  >
                    {p.status === "registered"
                      ? "판매중"
                      : p.status === "sold_out"
                        ? "품절"
                        : "숨김"}
                  </AdminStatusBadge>
                </td>
                <td className="max-w-48 p-3 text-xs text-gray-400">
                  {p.search_keywords
                    .slice(0, 3)
                    .map((t) => `#${t}`)
                    .join(" ")}
                  {p.search_keywords.length > 3
                    ? ` 외 ${p.search_keywords.length - 3}개`
                    : ""}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!data?.length ? (
          <p className="p-12 text-center text-sm text-gray-500">
            조건에 맞는 상품이 없습니다.
          </p>
        ) : null}
      </div>
      <nav
        aria-label="상품 목록 페이지"
        className="flex items-center justify-between text-sm"
      >
        {page > 1 ? <Link href={href(page - 1)}>← 이전</Link> : <span />}
        <span className="text-gray-500">
          {page} / {pages}
        </span>
        {page < pages ? <Link href={href(page + 1)}>다음 →</Link> : <span />}
      </nav>
    </div>
  );
}
