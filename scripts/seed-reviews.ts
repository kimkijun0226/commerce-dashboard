import { config } from "dotenv";
import { join } from "path";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import { getServerEnv } from "@/commons/config/env";
import type { Database } from "@/types/supabase";

config({ path: join(process.cwd(), ".env.local") });

type ReviewInsert = Database["public"]["Tables"]["reviews"]["Insert"];
type UserInsert = Database["public"]["Tables"]["users"]["Insert"];

const MIN_USERS = 30;
const MAX_PRODUCTS = 20;
const BATCH_SIZE = 10;

const REVIEW_CONTENT_SNIPPETS = [
  "배송이 빨랐고 포장도 깔끔했어요.",
  "사진이랑 실물이 비슷해서 만족합니다.",
  "가격 대비 품질이 괜찮아요.",
  "한번 써봤는데 생각보다 좋네요.",
  "재구매 의향 있어요.",
  "색감이 화면이랑 약간 달라요. 그래도 쓸만해요.",
  "고민하다 샀는데 잘 산 것 같아요.",
  "사이즈는 평소랑 같이 보시면 될 듯해요.",
  "약간 아쉽지만 전반적으로 나쁘지 않아요.",
  "친구한테도 추천했어요.",
  "기대 이상이에요. 추천합니다.",
  "배송 중 박스가 살짝 찌그러졌지만 제품은 멀쩡했어요.",
  "처음엔 어색했는데 익숙해지니 편해요.",
  "상세 설명이 도움이 됐어요.",
  "다음엔 다른 색도 사보고 싶어요.",
] as const;

const DISPLAY_NAME_POOL = [
  "Minji K.",
  "Sora T.",
  "Alex R.",
  "Jordan P.",
  "Riley H.",
  "Casey W.",
  "Taylor M.",
  "Chris L.",
  "Jamie N.",
  "Morgan S.",
  "Quinn V.",
  "Avery B.",
  "Drew L.",
  "Skyler J.",
  "Reese K.",
  "Rowan M.",
  "Emery C.",
  "Finley R.",
  "Hayden T.",
  "Blake W.",
  "Cameron H.",
  "Logan P.",
  "Parker D.",
  "Sage F.",
  "River G.",
  "Phoenix A.",
  "Eden Y.",
  "Remy O.",
  "Kai U.",
  "Noah I.",
  "Ivy E.",
  "Luna Q.",
  "Nova Z.",
  "Orion X.",
  "Atlas V.",
] as const;

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

function randomIntInclusive(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1));
}

function shuffleInPlace<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/** 10% / 10% / 10% / 40% / 30% for 1~5 stars */
function randomRating(): number {
  const r = Math.random() * 100;
  if (r < 10) return 1;
  if (r < 20) return 2;
  if (r < 30) return 3;
  if (r < 70) return 4;
  return 5;
}

function randomCreatedAtISO(): string {
  const daysAgo = randomIntInclusive(1, 180);
  const ms = Date.now() - daysAgo * 24 * 60 * 60 * 1000;
  return new Date(ms).toISOString();
}

function randomContent(): string {
  const i = randomIntInclusive(0, REVIEW_CONTENT_SNIPPETS.length - 1);
  return REVIEW_CONTENT_SNIPPETS[i] ?? "";
}

/**
 * 상품마다 서로 다른 목표 개수(가능한 범위 내).
 * 3~15 사이 정수 13개만 서로 다를 수 있으므로, 13개 초과분은 3~15 랜덤으로 채움.
 */
function assignPerProductReviewCounts(productCount: number): number[] {
  const pool = shuffleInPlace(
    Array.from({ length: 13 }, (_, i) => i + 3),
  ) as number[];
  if (productCount <= pool.length) {
    return pool.slice(0, productCount);
  }
  const base = [...pool];
  const extra = productCount - pool.length;
  for (let e = 0; e < extra; e++) {
    base.push(randomIntInclusive(3, 15));
  }
  return base;
}

function isDuplicateKeyError(err: unknown): boolean {
  if (!err || typeof err !== "object") return false;
  return "code" in err && (err as { code?: string }).code === "23505";
}

async function ensureMinUsers(
  supabase: SupabaseClient<Database, "public">,
  min: number,
): Promise<void> {
  const { count, error: countError } = await supabase
    .from("users")
    .select("*", { count: "exact", head: true });

  if (countError) {
    console.error("[users] 개수 조회 실패:", countError.message);
    throw countError;
  }

  const current = count ?? 0;
  console.log(`[users] 현재 ${current}명`);

  if (current >= min) {
    console.log(`[users] ${min}명 이상이므로 추가 생성 없음`);
    return;
  }

  const need = min - current;
  console.log(`[users] ${need}명 자동 생성`);

  const batchBase = Date.now();
  const rows: UserInsert[] = [];
  for (let j = 0; j < need; j++) {
    const name =
      DISPLAY_NAME_POOL[j % DISPLAY_NAME_POOL.length] ?? `User ${j + 1}`;
    rows.push({
      email: `review-autoseed-${batchBase}-${j}@seed.commerce-dashboard.local`,
      display_name: `${name} #${j + 1}`,
      role: "user",
    });
  }

  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const chunk = rows.slice(i, i + BATCH_SIZE);
    const { error } = await supabase.from("users").insert(chunk);
    if (error) {
      if (isDuplicateKeyError(error)) {
        console.warn("[users] 배치 중 중복 키(23505), 건너뜀:", error.message);
        continue;
      }
      console.error("[users] 배치 삽입 실패:", error.message);
      throw error;
    }
    console.log(
      `[users] 배치 ${Math.floor(i / BATCH_SIZE) + 1} 삽입 완료 (${chunk.length}명)`,
    );
  }
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

/**
 * 등록된(registered) 상품 최대 20개에 대해 리뷰를 랜덤 생성합니다.
 * - 사용자 최소 30명 보장
 * - (order_id, product_id) 기준으로 아직 리뷰가 없는 결제 완료 주문만 사용
 * - 동일 주문·동일 상품은 1건만 (여러 수량이어도 주문당 1건)
 * - 삽입은 10건 단위 배치
 */
export async function insertReviews(
  supabase: SupabaseClient<Database, "public">,
): Promise<void> {
  console.log("[reviews] 시드 시작");

  await ensureMinUsers(supabase, MIN_USERS);

  const { data: products, error: productsError } = await supabase
    .from("products")
    .select("id, name")
    .eq("status", "registered");

  if (productsError) {
    console.error("[reviews] 상품 조회 실패:", productsError.message);
    throw productsError;
  }

  if (!products?.length) {
    console.log("[reviews] registered 상품이 없어 종료합니다.");
    return;
  }

  shuffleInPlace(products);
  const selected = products.slice(0, Math.min(MAX_PRODUCTS, products.length));
  const counts = assignPerProductReviewCounts(selected.length);

  console.log(
    `[reviews] 대상 상품 ${selected.length}개 (registered 중 최대 ${MAX_PRODUCTS}개)`,
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
  for (const row of existingRows ?? []) {
    if (row.order_id) {
      taken.add(`${row.order_id}:${row.product_id}`);
    }
  }

  const toInsert: ReviewInsert[] = [];

  for (let pi = 0; pi < selected.length; pi++) {
    const product = selected[pi];
    if (!product) continue;
    const targetCount = counts[pi] ?? 3;

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
    const purchaseLines = (purchaseLinesData ?? []) as PurchaseLine[];

    type Pair = { userId: string; orderId: string };
    const byOrder = new Map<string, Pair>();
    for (const line of purchaseLines ?? []) {
      const o = line.orders as { user_id: string } | { user_id: string }[] | null;
      const ord = Array.isArray(o) ? o[0] : o;
      if (!ord?.user_id) continue;
      byOrder.set(line.order_id, { userId: ord.user_id, orderId: line.order_id });
    }

    const candidates = shuffleInPlace([...byOrder.values()]);
    let added = 0;

    for (const c of candidates) {
      if (added >= targetCount) break;
      const slot = `${c.orderId}:${product.id}`;
      if (taken.has(slot)) continue;
      taken.add(slot);
      toInsert.push({
        user_id: c.userId,
        product_id: product.id,
        order_id: c.orderId,
        rating: randomRating(),
        content: randomContent(),
        created_at: randomCreatedAtISO(),
      });
      added += 1;
    }

    if (added < targetCount) {
      console.warn(
        `[reviews] 상품 "${product.name}" (${product.id}): 목표 ${targetCount}건 → 실제 ${added}건 (결제 완료 주문·슬롯 부족)`,
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
}

async function main() {
  const supabase = createSupabaseSeedClient();
  await insertReviews(supabase);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("리뷰 시드 오류:", err);
    process.exit(1);
  });
