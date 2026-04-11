import { ProductDetail } from "@/components/commerce/ProductDetail/ProductDetail";
import { getProductById } from "@/features/products/api/useProductDetail";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ productId: string }>;
}) {
  const { productId } = await params;
  const product = await getProductById(productId);

  if (!product) {
    notFound();
  }

  return <ProductDetail product={product} />;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ productId: string }>;
}): Promise<Metadata> {
  const { productId } = await params;
  const product = await getProductById(productId);

  if (!product) {
    return { title: "상품을 찾을 수 없습니다" };
  }

  return {
    title: `${product.name} | Cursor Commerce`,
    description: product.description ?? undefined,
  };
}
