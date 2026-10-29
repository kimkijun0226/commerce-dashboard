import Link from "next/link";
import { checkAdminAccess } from "@/lib/auth/admin";
import { notFound } from "next/navigation";
import { STOREFRONTS, parseStoreKey } from "@/lib/catalog/storefront";
import { getStoreSettings } from "@/lib/catalog/settings";
import { getCatalogCategories } from "@/lib/catalog/products";
import { StoreSettingsEditor } from "@/components/admin/StoreSettingsEditor";
export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ department?: string }>;
}) {
  if (!(await checkAdminAccess())) notFound();
  const store = parseStoreKey((await searchParams).department);
  const [settings, categories] = await Promise.all([
    getStoreSettings(store),
    getCatalogCategories(store),
  ]);
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">로고 · 배너 관리</h1>
        <p className="mt-2 text-sm text-gray-500">
          매장별로 로고와 메인 광고를 관리하세요.
        </p>
      </div>
      <nav aria-label="설정할 매장" className="flex gap-2">
        {Object.values(STOREFRONTS).map((s) => (
          <Link
            key={s.key}
            href={`/admin/settings?department=${s.key}`}
            aria-current={store === s.key ? "page" : undefined}
            className={`border px-5 py-2 text-sm ${store === s.key ? "border-black bg-black text-white" : "border-gray-200 bg-white"}`}
          >
            {s.name}
          </Link>
        ))}
      </nav>
      <StoreSettingsEditor
        key={store}
        department={store}
        {...settings}
        categories={categories}
      />
    </div>
  );
}
