import { HomePage } from "@/components/commerce/home/HomePage";
import { getCatalogCategories, getCatalogProducts } from "@/lib/catalog/products";
import { CATALOG_PAGE_SIZE } from "@/lib/catalog/constants";

export default async function CommercePage() {
  const [catalog, categories] = await Promise.all([
    getCatalogProducts({ page: 0, pageSize: CATALOG_PAGE_SIZE }),
    getCatalogCategories(),
  ]);
  return <HomePage initialItems={catalog.items} initialTotal={catalog.total} categories={categories} />;
}
