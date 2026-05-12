import { getPublicEnv } from "@/commons/config/env";
import { getReviewWriteEligibility } from "@/app/(commerce)/products/[productId]/review-actions";
import { ProductDetail } from "@/components/commerce/ProductDetail/ProductDetail";
import { getProductById } from "@/features/products/api/useProductDetail";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

const DEFAULT_OG_PATH = "/vercel.svg";

function resolveAbsoluteImageUrl(
  imageUrl: string | null | undefined,
  siteUrl: string,
): string | null {
  const trimmed = imageUrl?.trim();
  if (!trimmed) return null;
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }
  const base = siteUrl.replace(/\/$/, "");
  const path = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  return `${base}${path}`;
}

export default async function ProductDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ productId: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { productId } = await params;
  const sp = (await Promise.resolve(
    searchParams ?? {},
  )) as Record<string, string | string[] | undefined>;
  const rawOpen = sp.openReview;
  const openVal = Array.isArray(rawOpen) ? rawOpen[0] : rawOpen;
  const defaultReviewsTab =
    openVal === "1" || openVal === "true" || openVal === "yes";
  const rawOrder = sp.orderId;
  const orderIdParam =
    typeof rawOrder === "string"
      ? rawOrder.trim()
      : Array.isArray(rawOrder)
        ? String(rawOrder[0] ?? "").trim()
        : "";

  const product = await getProductById(productId);

  if (!product) {
    notFound();
  }

  const reviewWriteEligibility = await getReviewWriteEligibility(productId);

  return (
    <ProductDetail
      product={product}
      reviewWriteEligibility={reviewWriteEligibility}
      defaultReviewsTab={defaultReviewsTab}
      initialReviewOrderId={orderIdParam || null}
    />
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ productId: string }>;
}): Promise<Metadata> {
  const { productId } = await params;
  const product = await getProductById(productId);
  const { siteUrl } = getPublicEnv();
  const baseSite = siteUrl.replace(/\/$/, "");

  if (!product) {
    return {
      title: "상품을 찾을 수 없습니다 - Cursor Commerce",
      description:
        "요청하신 상품을 찾을 수 없습니다. 목록에서 다른 상품을 둘러보세요.",
      keywords: ["Cursor Commerce", "상품", "커머스"],
    };
  }

  const description =
    product.description?.trim() ||
    `${product.name} 상품 상세 정보를 확인하세요.`;

  const resolvedImage =
    resolveAbsoluteImageUrl(product.imageUrl, siteUrl) ??
    `${baseSite}${DEFAULT_OG_PATH}`;

  return {
    title: `${product.name} - Cursor Commerce`,
    description,
    keywords: [product.name, "상품", "커머스"],
    openGraph: {
      title: product.name,
      description,
      type: "website",
      images: [
        {
          url: resolvedImage,
          width: 1200,
          height: 630,
          alt: product.name,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: product.name,
      description,
      images: [resolvedImage],
    },
  };
}
