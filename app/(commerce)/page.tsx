import { HomePage } from "@/components/commerce/home/HomePage";
import {
  getCatalogProducts,
} from "@/lib/catalog/products";
import { CATALOG_PAGE_SIZE } from "@/lib/catalog/constants";

export default async function CommercePage() {
  const { items } = await getCatalogProducts({ page: 0, pageSize: CATALOG_PAGE_SIZE });
  return <HomePage initialItems={items} />;
}
