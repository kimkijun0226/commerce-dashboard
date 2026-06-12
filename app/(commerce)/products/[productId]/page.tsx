import { getPublicEnv } from "@/commons/config/env";
import { parseAiReviewSummaryFromProductJson } from "@/commons/types/product-review-summary";
import { EnhancedReviewSummary } from "@/app/(commerce)/products/[productId]/_components/EnhancedReviewSummary";
import { getReviewWriteEligibility } from "@/app/(commerce)/products/[productId]/review-actions";
import { ReviewList } from "@/app/(commerce)/products/[productId]/_components/ReviewList";
import { checkAdminAccess } from "@/lib/auth/admin";
import { createClient } from "@/lib/supabase/server";
import { ProductDetail } from "@/components/commerce/ProductDetail/ProductDetail";
import { ReviewListSkeleton, ReviewSummarySkeleton } from "@/components/ui";
import type { Review } from "@/features/products/api/useProductReviews";
import { getProductById } from "@/features/products/api/useProductDetail";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

const DEFAULT_OG_PATH = "/vercel.svg";
const REVIEW_LIST_PAGE_SIZE = 5;
const EMPTY_REVIEW_CONFIDENCE_METRICS = {
  reviewCount: 0,
  ratingVariance: 0,
  averageReviewLength: 0,
  summaryStability: 1,
};

// searchParams가 string/array 어느 형태로 와도 첫 번째 값만 꺼내 씁니다.
function firstSearchParam(
  value: string | string[] | undefined,
): string {
  if (Array.isArray(value)) return String(value[0] ?? "").trim();
  return typeof value === "string" ? value.trim() : "";
}

// 메타데이터용 이미지 URL을 절대 경로 형태로 정규화합니다.
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

// 상세 페이지 부가 데이터 조회에서 노출할 오류 메시지를 짧게 정리합니다.
function normalizePageSupabaseErrorMessage(message: string): string {
  const m = message?.trim() ?? "";
  if (!m) return "알 수 없는 오류";
  if (m.includes("fetch failed")) {
    return "일시적인 네트워크 오류가 발생했습니다.";
  }
  if (m.startsWith("<!DOCTYPE html>") || m.startsWith("<html")) {
    return "일시적인 네트워크 오류가 발생했습니다.";
  }
  if (m.includes("502") || m.toLowerCase().includes("bad gateway")) {
    return "일시적인 네트워크 오류가 발생했습니다.";
  }
  return m.length > 300 ? `${m.slice(0, 300)}…` : m;
}

// 신뢰도 지표는 부가 정보이므로, 일시 실패 시 기본값으로 안전하게 폴백합니다.
async function sleep(ms: number) {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

// 상품 본문은 먼저 렌더링하고, 리뷰 관련 블록은 Suspense로 점진적으로 보여 줍니다.
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
  const openVal = firstSearchParam(sp.openReview);
  const openReviewRequested =
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
  const initialComposerOpen =
    openReviewRequested && reviewWriteEligibility.canCreate;

  return (
    <ProductDetail
      product={product}
      reviewWriteEligibility={reviewWriteEligibility}
      initialComposerOpen={initialComposerOpen}
      initialReviewOrderId={orderIdParam || null}
      reviewSummarySection={
        <Suspense fallback={<ReviewSummarySkeleton />}>
          <ReviewSummarySection productId={productId} />
        </Suspense>
      }
      reviewListSection={
        <Suspense fallback={<ReviewListSkeleton />}>
          <ReviewListSection productId={productId} />
        </Suspense>
      }
    />
  );
}

// users embed는 서버/클라이언트 응답 모양이 조금 달라질 수 있어 상세 페이지용으로 한 번 정규화합니다.
function normalizeUsersEmbed(raw: unknown): Review["users"] {
  if (raw == null) return null;
  if (Array.isArray(raw)) {
    const first = raw[0];
    if (first && typeof first === "object" && "email" in first) {
      const o = first as {
        display_name: string | null;
        email: string;
        image_url?: string | null;
      };
      return {
        display_name: o.display_name ?? null,
        email: o.email,
        image_url: o.image_url ?? null,
      };
    }
    return null;
  }
  if (typeof raw === "object" && "email" in raw) {
    const o = raw as {
      display_name: string | null;
      email: string;
      image_url?: string | null;
    };
    return {
      display_name: o.display_name ?? null,
      email: o.email,
      image_url: o.image_url ?? null,
    };
  }
  return null;
}

// 첫 렌더에 바로 쓸 수 있도록 저장된 AI 요약을 서버에서 먼저 읽어 옵니다.
async function fetchInitialReviewSummary(productId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("review_summary")
    .eq("id", productId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return parseAiReviewSummaryFromProductJson(data?.review_summary ?? null);
}

// 신뢰도 UI에서 쓸 기본 지표를 서버에서 먼저 계산해 초기 렌더에 함께 싣습니다.
async function fetchReviewConfidenceMetrics(productId: string) {
  const supabase = await createClient();

  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      const { data, error } = await supabase
        .from("reviews")
        .select("rating, content")
        .eq("product_id", productId);

      if (error) {
        const normalized = normalizePageSupabaseErrorMessage(error.message);
        if (
          attempt === 0 &&
          (normalized.includes("네트워크 오류") || normalized.includes("fetch failed"))
        ) {
          await sleep(250);
          continue;
        }
        console.error("[fetchReviewConfidenceMetrics]", normalized);
        return EMPTY_REVIEW_CONFIDENCE_METRICS;
      }

      const rows = data ?? [];
      const ratings = rows
        .map((row) => Number(row.rating))
        .filter((value) => Number.isFinite(value));
      const reviewCount = ratings.length;
      const meanRating =
        reviewCount > 0
          ? ratings.reduce((sum, value) => sum + value, 0) / reviewCount
          : 0;
      const ratingVariance =
        reviewCount > 0
          ? ratings.reduce((sum, value) => sum + (value - meanRating) ** 2, 0) /
            reviewCount
          : 0;

      const reviewBodies = rows
        .map((row) => String(row.content ?? "").trim())
        .filter((value) => value.length > 0);
      const averageReviewLength =
        reviewBodies.length > 0
          ? reviewBodies.reduce((sum, value) => sum + value.length, 0) /
            reviewBodies.length
          : 0;

      return {
        reviewCount,
        ratingVariance,
        averageReviewLength,
        summaryStability: 1,
      };
    } catch (e) {
      const message = normalizePageSupabaseErrorMessage(
        e instanceof Error ? e.message : String(e),
      );
      if (
        attempt === 0 &&
        (message.includes("네트워크 오류") || message.includes("fetch failed"))
      ) {
        await sleep(250);
        continue;
      }
      console.error("[fetchReviewConfidenceMetrics]", message);
      return EMPTY_REVIEW_CONFIDENCE_METRICS;
    }
  }

  return EMPTY_REVIEW_CONFIDENCE_METRICS;
}

// 리뷰 목록 첫 페이지를 서버에서 미리 읽어 클라이언트 쿼리의 initialData로 사용합니다.
async function fetchInitialReviews(productId: string): Promise<Review[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("reviews")
    .select(
      `
      id,
      user_id,
      rating,
      content,
      created_at,
      users (
        display_name,
        email,
        image_url
      )
    `,
    )
    .eq("product_id", productId)
    .order("created_at", { ascending: false })
    .range(0, REVIEW_LIST_PAGE_SIZE - 1);

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map((row) => {
    const { users: u, ...rest } = row as Omit<Review, "users"> & {
      users: unknown;
    };
    return {
      ...rest,
      users: normalizeUsersEmbed(u),
    };
  });
}

// 요약 영역은 별도 서버 컴포넌트로 분리해 상세 본문과 독립적으로 Suspense 처리합니다.
async function ReviewSummarySection({ productId }: { productId: string }) {
  const [initialData, isAdmin, confidenceMetrics] = await Promise.all([
    fetchInitialReviewSummary(productId),
    checkAdminAccess(),
    fetchReviewConfidenceMetrics(productId),
  ]);

  return (
    <EnhancedReviewSummary
      productId={productId}
      isAdmin={isAdmin}
      initialSummary={initialData}
      reviewCount={confidenceMetrics.reviewCount}
      ratingVariance={confidenceMetrics.ratingVariance}
      averageReviewLength={confidenceMetrics.averageReviewLength}
      summaryStability={confidenceMetrics.summaryStability}
    />
  );
}

// 리뷰 목록도 첫 페이지를 서버에서 미리 내려 준 뒤, 이후 페이지부터 클라이언트가 이어받습니다.
async function ReviewListSection({ productId }: { productId: string }) {
  const supabase = await createClient();
  const [
    initialReviews,
    {
      data: { user },
    },
    isSuperAdmin,
  ] = await Promise.all([
    fetchInitialReviews(productId),
    supabase.auth.getUser(),
    checkAdminAccess(),
  ]);

  return (
    <ReviewList
      productId={productId}
      initialReviews={initialReviews}
      currentUserId={user?.id ?? null}
      isSuperAdmin={isSuperAdmin}
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
      title: "상품을 찾을 수 없습니다 - Commerce Dashboard",
      description:
        "요청하신 상품을 찾을 수 없습니다. 목록에서 다른 상품을 둘러보세요.",
      keywords: ["Commerce Dashboard", "상품", "커머스"],
    };
  }

  const description =
    product.description?.trim() ||
    `${product.name} 상품 상세 정보를 확인하세요.`;

  const resolvedImage =
    resolveAbsoluteImageUrl(product.imageUrl, siteUrl) ??
    `${baseSite}${DEFAULT_OG_PATH}`;

  return {
    title: `${product.name} - Commerce Dashboard`,
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
