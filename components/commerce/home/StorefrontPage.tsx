import type { StoreKey } from "@/lib/catalog/storefront";
import { HomePage } from "@/components/commerce/home/HomePage";
import { getCatalogCategories, getCatalogProducts } from "@/lib/catalog/products";
import { CATALOG_PAGE_SIZE } from "@/lib/catalog/constants";

export async function StorefrontPage({ department }: { department: StoreKey }) {
  const [catalog, categories] = await Promise.all([
    getCatalogProducts({ page: 0, pageSize: CATALOG_PAGE_SIZE, department }),
    getCatalogCategories(department),
  ]);
  return <HomePage key={department} department={department} initialItems={catalog.items} initialTotal={catalog.total} categories={categories} />;
}
