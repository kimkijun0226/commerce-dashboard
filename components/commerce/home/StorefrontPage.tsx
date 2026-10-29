import { getStoreSettings } from "@/lib/catalog/settings";
import type { StoreKey } from "@/lib/catalog/storefront";
import { HomePage } from "@/components/commerce/home/HomePage";
import { getCatalogCategories, getCatalogProducts } from "@/lib/catalog/products";
import { CATALOG_PAGE_SIZE } from "@/lib/catalog/constants";

export type StorefrontSearchParams = Promise<Record<string, string | string[] | undefined>>;

export async function StorefrontPage({ department, searchParams }: { department: StoreKey; searchParams?: StorefrontSearchParams }) {
  const params = await searchParams;
  const q = typeof params?.q === "string" ? params.q.slice(0, 200) : "";
  const category = typeof params?.category === "string" ? params.category.slice(0, 100) : "";
  const [catalog, categories, settings] = await Promise.all([
    getCatalogProducts({ page: 0, pageSize: CATALOG_PAGE_SIZE, department, q, category }),
    getCatalogCategories(department),
    getStoreSettings(department),
  ]);
  const allTotal = q || category ? (await getCatalogProducts({ department, pageSize: 1 })).total : catalog.total;
  return <HomePage campaigns={settings.banners} key={`${department}:${q}:${category}`} initialQuery={q} initialCategory={category} allTotal={allTotal} department={department} initialItems={catalog.items} initialTotal={catalog.total} categories={categories} />;
}
