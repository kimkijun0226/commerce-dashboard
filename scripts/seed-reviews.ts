import { randomUUID } from "crypto";
import { config } from "dotenv";
import { join } from "path";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import { parseProductReviewSummary } from "@/commons/types/product-review-summary";
import { getServerEnv } from "@/commons/config/env";
import { generateFullReviewSummary } from "@/lib/ai/review-summary";
import type { Database, Json } from "@/types/supabase";

config({ path: join(process.cwd(), ".env.local") });

type ReviewInsert = Database["public"]["Tables"]["reviews"]["Insert"];
type ProductRow = {
  id: string;
  name: string;
  price: number;
  sale_price: number | null;
  image_url: string | null;
  categories: string[] | null;
};

const MIN_REVIEWS_PER_PRODUCT = 5;
const MAX_REVIEWS_PER_PRODUCT = 25;
const BATCH_SIZE = 10;

const OPENERS = [
  "처음엔 고민했는데",
  "배송 받자마자",
  "일주일 써본 뒤",
  "친구 추천으로",
  "세일 때",
  "리뷰 보고",
  "교체용으로",
  "선물용으로",
  "출퇴근용으로",
  "주말에 써봤는데",
  "두 번째 구매인데",
  "비슷한 제품 써보다가",
  "기대 반 걱정 반으로",
  "포장 열어보니",
  "실사용 후기로",
] as const;

const DETAILS = [
  "마감이 깔끔하고 실물이 사진과 비슷해요.",
  "가격 대비 만족도가 높습니다.",
  "디테일이 괜찮고 쓰기 편해요.",
  "생각보다 퀄리티가 좋아서 놀랐어요.",
  "사이즈·핏은 평소와 같이 고르시면 될 것 같아요.",
  "색감이 은은해서 데일리로 쓰기 좋아요.",
  "무게감이 적당해서 부담 없이 들고 다녀요.",
  "배터리·내구성 면에서 체감이 좋습니다.",
  "처음엔 어색했는데 익숙해지니 편해졌어요.",
  "포장 상태도 좋고 구성품도 빠짐없이 왔어요.",
  "약간 아쉬운 부분은 있지만 전반적으로 괜찮아요.",
  "사용법이 단순해서 바로 적응했습니다.",
  "디자인이 무난해서 어디에나 잘 어울려요.",
  "성능은 기대했던 수준이고 소음도 크지 않아요.",
  "재질감이 생각보다 고급스럽게 느껴졌어요.",
] as const;

const CLOSINGS = [
  "재구매 의향 있습니다.",
  "추천해요.",
  "가성비 좋은 편이에요.",
  "다음에 다른 옵션도 사볼 생각이에요.",
  "만족하고 씁니다.",
  "고민하시는 분들께 도움이 됐으면 해요.",
  "전반적으로 잘 산 것 같아요.",
  "배송도 빨라서 좋았습니다.",
  "아직은 잘 모르겠지만 써보면서 지켜볼게요.",
  "기대 이상이었어요.",
] as const;

const CATEGORY_HINTS: Record<string, string[]> = {
  전자제품: [
    "연결도 빠르고 끊김이 거의 없어요.",
    "충전 속도와 사용 시간이 괜찮습니다.",
    "터치 반응이나 버튼 감도가 자연스러워요.",
  ],
  의류: [
    "세탁 후에도 형태가 잘 유지됐어요.",
    "착용감이 편하고 활동하기 좋아요.",
    "계절감에 맞게 레이어하기 좋습니다.",
  ],
  "가방·액세서리": [
    "수납 공간 배치가 실용적이에요.",
    "스트랩 길이 조절이 편해서 좋아요.",
    "데일리로 들고 다니기 좋은 사이즈예요.",
  ],
  운동용품: [
    "운동할 때 미끄럽지 않고 안정감이 있어요.",
    "가볍게 들고 다니기 좋아요.",
    "홈트·헬스 둘 다 무난하게 쓸 만해요.",
  ],
};

export function createSupabaseSeedClient(): SupabaseClient<Database, "public"> {
  const { supabase } = getServerEnv();
  return createClient<Database, "public">(supabase.url, supabase.secretKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
    db: { schema: "public" },
  });
}

function shuffleInPlace<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/** 10% / 10% / 10% / 40% / 30% for 1~5 stars (0.5 단위, 최소 1.0) */
function randomRating(): number {
  const r = Math.random() * 100;
  const base =
    r < 10 ? 1 : r < 20 ? 2 : r < 30 ? 3 : r < 70 ? 4 : 5;
  if (base === 1 || Math.random() >= 0.35) return base;
  return base - 0.5;
}

function randomCreatedAtISO(seed: number): string {
  const daysAgo = 1 + (seed % 180);
  const ms = Date.now() - daysAgo * 24 * 60 * 60 * 1000 - (seed % 86400000);
  return new Date(ms).toISOString();
}

function pickFrom<T>(arr: readonly T[], seed: number): T {
  return arr[seed % arr.length] as T;
}

function generateReviewContent(product: ProductRow, reviewIndex: number): string {
  const seed = product.id.charCodeAt(0) + product.id.charCodeAt(8) + reviewIndex * 17;
  const opener = pickFrom(OPENERS, seed);
  const detail = pickFrom(DETAILS, seed * 3 + 1);
  const closing = pickFrom(CLOSINGS, seed * 7 + 2);

  const category = product.categories?.[0];
  const hints = category ? CATEGORY_HINTS[category] : undefined;
  const hint = hints ? pickFrom(hints, seed * 11 + 3) : null;

  const parts = [`${opener} ${product.name} 구매했어요.`, detail];
  if (hint) parts.push(hint);
  parts.push(closing);
  return parts.join(" ");
}

/** 상품 ID 기준 고정 목표 개수 (5~25, 재실행해도 동일) */
function targetReviewCountForProduct(productId: string): number {
  let hash = 0;
  for (let i = 0; i < productId.length; i++) {
    hash = (hash * 31 + productId.charCodeAt(i)) >>> 0;
  }
  const span = MAX_REVIEWS_PER_PRODUCT - MIN_REVIEWS_PER_PRODUCT + 1;
  return MIN_REVIEWS_PER_PRODUCT + (hash % span);
}

/** auth.users와 연동된 public.users ID 목록 (리뷰·주문 시드용) */
async function loadSeedUserIds(
  supabase: SupabaseClient<Database, "public">,
): Promise<string[]> {
  const { data: existingUsers, error: listError } = await supabase
    .from("users")
    .select("id")
    .order("created_at", { ascending: true });

  if (listError) {
    console.error("[users] 조회 실패:", listError.message);
    throw listError;
  }

  const ids = (existingUsers ?? []).map((u) => u.id).filter(Boolean);
  console.log(`[users] 시드에 사용할 사용자 ${ids.length}명`);

  if (ids.length === 0) {
    throw new Error(
      "public.users에 사용자가 없습니다. 회원가입 후 다시 실행하거나 auth 연동 사용자를 먼저 만드세요.",
    );
  }

  return ids;
}

async function createSyntheticPaidOrder(
  supabase: SupabaseClient<Database, "public">,
  userId: string,
  product: ProductRow,
): Promise<string | null> {
  const orderId = randomUUID();
  const unitPrice = Number(product.sale_price ?? product.price);
  const now = new Date().toISOString();

  const { error: orderErr } = await supabase.from("orders").insert({
    id: orderId,
    user_id: userId,
    status: "paid",
    total_amount: unitPrice,
    subtotal_amount: unitPrice,
    shipping_fee: 0,
    discount_amount: 0,
    currency: "KRW",
    payment_status: "success",
    paid_at: now,
    created_at: now,
  });

  if (orderErr) {
    console.warn(`[orders] 생성 실패 (${product.name}):`, orderErr.message);
    return null;
  }

  const { error: itemErr } = await supabase.from("order_items").insert({
    order_id: orderId,
    product_id: product.id,
    quantity: 1,
    unit_price: unitPrice,
    unit_sale_price: product.sale_price,
    product_name: product.name,
    product_image_url: product.image_url,
    line_subtotal: unitPrice,
  });

  if (itemErr) {
    await supabase.from("orders").delete().eq("id", orderId);
    console.warn(`[order_items] 생성 실패 (${product.name}):`, itemErr.message);
    return null;
  }

  const { error: payErr } = await supabase.from("payments").insert({
    order_id: orderId,
    user_id: userId,
    provider: "mock",
    method: "card",
    amount: unitPrice,
    currency: "KRW",
    status: "succeeded",
    approved_at: now,
  });

  if (payErr) {
    await supabase.from("orders").delete().eq("id", orderId);
    console.warn(`[payments] 생성 실패 (${product.name}):`, payErr.message);
    return null;
  }

  return orderId;
}

async function insertReviewBatches(
  supabase: SupabaseClient<Database, "public">,
  rows: ReviewInsert[],
): Promise<{ inserted: number; failed: number }> {
  let inserted = 0;
  let failed = 0;

  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const chunk = rows.slice(i, i + BATCH_SIZE);
    const batchNo = Math.floor(i / BATCH_SIZE) + 1;
    const { error } = await supabase.from("reviews").insert(chunk);
    if (error) {
      console.error(
        `[reviews] 배치 ${batchNo} 실패 (${chunk.length}건):`,
        error.message,
      );
      failed += chunk.length;
      continue;
    }
    inserted += chunk.length;
    console.log(
      `[reviews] 배치 ${batchNo} 삽입 완료 (${chunk.length}건, 누적 ${inserted}건)`,
    );
  }

  return { inserted, failed };
}

async function updateProductRatingSummary(
  supabase: SupabaseClient<Database, "public">,
  productId: string,
): Promise<void> {
  const { data: ratingRows, error } = await supabase
    .from("reviews")
    .select("rating, content")
    .eq("product_id", productId);

  if (error || !ratingRows?.length) return;

  const reviews = ratingRows
    .filter((r) => r.content != null && String(r.content).trim().length > 0)
    .map((r) => ({
      rating: Number(r.rating),
      content: String(r.content).trim(),
    }));

  const sum = reviews.reduce((acc, row) => acc + row.rating, 0);
  const avg = Math.round((sum / reviews.length) * 10) / 10;

  const { data: productRow } = await supabase
    .from("products")
    .select("review_summary")
    .eq("id", productId)
    .maybeSingle();

  let reviewSummary: Json = {
    count: reviews.length,
    highlight:
      reviews.find((r) => r.content.length > 20)?.content.slice(0, 80) ??
      "구매자 리뷰가 업데이트되었습니다.",
  };

  if (process.env.GEMINI_API_KEY?.trim() && reviews.length > 0) {
    try {
      const ai = await generateFullReviewSummary(reviews);
      const prev = parseProductReviewSummary(productRow?.review_summary ?? null);
      reviewSummary = {
        count: reviews.length,
        highlight:
          ai.positive_points[0]?.slice(0, 80) ||
          ai.summary.split("\n")[0]?.slice(0, 80) ||
          prev?.highlight ||
          "",
        ai,
      } as Json;
    } catch (e) {
      console.warn(
        `[reviews] AI 요약 생성 실패 (${productId}):`,
        e instanceof Error ? e.message : e,
      );
    }
  }

  await supabase
    .from("products")
    .update({
      rating_average: avg,
      review_summary: reviewSummary,
    })
    .eq("id", productId);
}

/**
 * registered 상품 전체에 대해 상품마다 5~25건의 서로 다른 리뷰를 생성합니다.
 * - 결제 완료 주문 슬롯이 부족하면 시드용 주문·결제를 자동 생성
 * - (order_id, product_id) 조합당 1건
 */
export async function insertReviews(
  supabase: SupabaseClient<Database, "public">,
): Promise<void> {
  console.log("[reviews] 시드 시작");

  const userIds = await loadSeedUserIds(supabase);
  let userCursor = 0;

  const nextUserId = (): string => {
    const id = userIds[userCursor % userIds.length];
    userCursor += 1;
    if (!id) throw new Error("시드용 사용자 ID가 없습니다.");
    return id;
  };

  const { data: products, error: productsError } = await supabase
    .from("products")
    .select("id, name, price, sale_price, image_url, categories")
    .eq("status", "registered")
    .order("name", { ascending: true });

  if (productsError) {
    console.error("[reviews] 상품 조회 실패:", productsError.message);
    throw productsError;
  }

  if (!products?.length) {
    console.log("[reviews] registered 상품이 없어 종료합니다.");
    return;
  }

  const selected = products as ProductRow[];

  console.log(
    `[reviews] 대상 상품 ${selected.length}개 (상품당 ${MIN_REVIEWS_PER_PRODUCT}~${MAX_REVIEWS_PER_PRODUCT}건)`,
  );

  const productIds = selected.map((p) => p.id);

  const { data: existingRows, error: revError } = await supabase
    .from("reviews")
    .select("order_id, product_id")
    .in("product_id", productIds);

  if (revError) {
    console.error("[reviews] 기존 리뷰 조회 실패:", revError.message);
    throw revError;
  }

  const taken = new Set<string>();
  const existingByProduct = new Map<string, number>();
  for (const row of existingRows ?? []) {
    if (row.order_id) {
      taken.add(`${row.order_id}:${row.product_id}`);
    }
    existingByProduct.set(
      row.product_id,
      (existingByProduct.get(row.product_id) ?? 0) + 1,
    );
  }

  const toInsert: ReviewInsert[] = [];
  const usedContent = new Set<string>();

  for (const product of selected) {

    const targetCount = targetReviewCountForProduct(product.id);
    const existingCount = existingByProduct.get(product.id) ?? 0;

    if (existingCount >= targetCount) {
      console.log(
        `[reviews] "${product.name}": 기존 ${existingCount}건 ≥ 목표 ${targetCount}건 → 건너뜀`,
      );
      continue;
    }

    const need = targetCount - existingCount;
    let added = 0;
    let reviewSeq = existingCount;

    const { data: purchaseLinesData, error: plError } = await supabase
      .from("order_items")
      .select("order_id, orders!inner(user_id, status, payment_status)")
      .eq("product_id", product.id)
      .eq("orders.status", "paid")
      .eq("orders.payment_status", "success");

    if (plError) {
      console.error(`[reviews] 주문 조회 실패 (${product.name}):`, plError.message);
      continue;
    }

    type PurchaseLine = {
      order_id: string;
      orders: { user_id: string } | { user_id: string }[] | null;
    };
    const purchaseLines = shuffleInPlace(
      [...((purchaseLinesData ?? []) as PurchaseLine[])],
    );

    type Pair = { userId: string; orderId: string };
    const byOrder = new Map<string, Pair>();
    for (const line of purchaseLines) {
      const o = line.orders;
      const ord = Array.isArray(o) ? o[0] : o;
      if (!ord?.user_id) continue;
      byOrder.set(line.order_id, { userId: ord.user_id, orderId: line.order_id });
    }

    const candidates = [...byOrder.values()];

    const addReview = (userId: string, orderId: string) => {
      const slot = `${orderId}:${product.id}`;
      if (taken.has(slot)) return false;

      let content = generateReviewContent(product, reviewSeq);
      let guard = 0;
      while (usedContent.has(content) && guard < 20) {
        reviewSeq += 1;
        content = generateReviewContent(product, reviewSeq);
        guard += 1;
      }
      usedContent.add(content);
      taken.add(slot);
      toInsert.push({
        user_id: userId,
        product_id: product.id,
        order_id: orderId,
        rating: randomRating(),
        content,
        created_at: randomCreatedAtISO(reviewSeq + targetCount * 3),
      });
      reviewSeq += 1;
      added += 1;
      return true;
    };

    for (const c of candidates) {
      if (added >= need) break;
      addReview(c.userId, c.orderId);
    }

    while (added < need) {
      const userId = nextUserId();
      const orderId = await createSyntheticPaidOrder(supabase, userId, product);
      if (!orderId) break;
      if (!addReview(userId, orderId)) break;
    }

    console.log(
      `[reviews] "${product.name}": 목표 ${targetCount}건 (기존 ${existingCount} + 신규 ${added})`,
    );

    if (added < need) {
      console.warn(
        `[reviews] "${product.name}": ${need - added}건 부족 (주문·슬롯 생성 한도)`,
      );
    }
  }

  if (toInsert.length === 0) {
    console.log("[reviews] 삽입할 신규 리뷰가 없습니다.");
    return;
  }

  console.log(`[reviews] 신규 삽입 예정: ${toInsert.length}건`);

  const { inserted, failed } = await insertReviewBatches(supabase, toInsert);
  console.log(
    `[reviews] 완료: 성공 ${inserted}건, 실패 ${failed}건 (배치 크기 ${BATCH_SIZE})`,
  );

  console.log("[reviews] 상품별 평점·요약 갱신 중...");
  for (const product of selected) {
    await updateProductRatingSummary(supabase, product.id);
  }
  console.log("[reviews] 평점·요약 갱신 완료");
}

async function main() {
  const supabase = createSupabaseSeedClient();
  await insertReviews(supabase);
}

const isDirectRun = process.argv[1]?.includes("seed-reviews");
if (isDirectRun) {
  main()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error("리뷰 시드 오류:", err);
      process.exit(1);
    });
}
