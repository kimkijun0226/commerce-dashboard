import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { config } from "dotenv";
import { composeKoreanReview, REVIEW_COPY } from "./data/korean-review-copy";
import { getProjectRefFromSupabaseUrl, managementDbExec } from "./managementDbQuery";

config({ path: join(process.cwd(), ".env.local"), quiet: true });

const TABLES = [
  "reviews", "payments", "order_items", "cart_items", "like_items",
  "orders", "products", "user_addresses", "mcp_settings",
] as const;
const LEGACY_IDS = [83, 84, 85, 86, 87, 162, 163, 164, 165, 166, 177, 178, 179, 180, 181];
const DAY = 86_400_000;
const CATALOG_DATE = Date.parse("2026-10-29T09:00:00+09:00");
const FAMILY_NAMES = ["김", "이", "박", "최", "정", "강", "조", "윤", "장", "임", "한", "오"];
const GIVEN_NAMES = ["지", "현", "민", "연", "진", "영", "은", "호", "빈", "수", "우", "아", "율", "원", "준"];

type Category = keyof typeof REVIEW_COPY;
type SourceProduct = {
  id: string;
  name: string;
  brand: string;
  category: Category;
  gender: string;
  price: number;
  imageUrl: string;
  images: string[];
  sourceUrl: string;
  originalTitle: string;
};

const CATEGORY_COPY: Record<Category, string> = {
  티셔츠: "단독으로도, 셔츠나 아우터 안에 겹쳐 입어도 자연스러운 티셔츠입니다. 데님과 매치하면 편안하게, 슬랙스와 함께하면 깔끔한 데일리 룩으로 연출할 수 있어요.",
  셔츠: "데일리 룩부터 출근 룩까지 활용할 수 있는 셔츠입니다. 단추를 잠가 단정하게 입거나, 기본 티셔츠 위에 가볍게 걸쳐 여유로운 분위기로 연출해 보세요.",
  팬츠: "상의에 따라 다양한 분위기로 입기 좋은 팬츠입니다. 티셔츠와 운동화로 편안하게, 셔츠와 로퍼로 깔끔하게 코디해 보세요. 기장과 허리는 평소 잘 맞는 바지와 비교해 주세요.",
  니트: "짜임과 실루엣이 코디에 자연스러운 포인트가 되는 니트입니다. 단독으로 입거나 셔츠와 함께 레이어드해 보세요. 보관할 때는 옷걸이보다 접어서 두는 것을 권장합니다.",
  자켓: "기본 이너 위에 걸치는 것만으로 분위기를 정돈해 주는 자켓입니다. 데님과 함께 캐주얼하게, 슬랙스와 함께 단정한 출근 룩으로 활용해 보세요.",
  코트: "니트나 셔츠 위에 매치하기 좋은 코트입니다. 간결한 이너와 팬츠를 함께 코디하면 전체 실루엣이 자연스럽게 살아납니다. 안에 입을 옷의 두께를 고려해 사이즈를 선택해 주세요.",
};

function id(key: string) {
  const hash = createHash("sha256").update(`commerce-fashion:${key}`).digest("hex");
  return `${hash.slice(0, 8)}-${hash.slice(8, 12)}-4${hash.slice(13, 16)}-a${hash.slice(17, 20)}-${hash.slice(20, 32)}`;
}

function sqlJson(value: unknown) {
  return `'${JSON.stringify(value).replaceAll("'", "''")}'::jsonb`;
}

function insert(table: string, rows: object[], refresh: boolean) {
  const columns = Object.keys(rows[0]);
  const conflict = refresh
    ? `DO UPDATE SET ${columns.filter((c) => c !== "id").map((c) => c === "review_summary"
      ? "review_summary = coalesce(products.review_summary, '{}'::jsonb) || EXCLUDED.review_summary"
      : `${c} = EXCLUDED.${c}`).join(",")}`
    : "DO NOTHING";
  return `INSERT INTO public.${table} (${columns.join(",")}) SELECT ${columns.join(",")} FROM jsonb_populate_recordset(NULL::public.${table}, ${sqlJson(rows)}) ON CONFLICT (id) ${conflict};`;
}

function buildCatalog(source: SourceProduct[]) {
  const reviews = source.flatMap((p) => {
    const seed = Number(p.id);
    return Array.from({ length: 12 + seed % 15 }, (_, index) => ({
      id: id(`review:${p.id}:${index}`),
      user_id: null,
      order_id: null,
      product_id: id(`product:${p.id}`),
      ...composeKoreanReview(p.category, seed, index),
      created_at: new Date(CATALOG_DATE - ((seed + index * 11) % 120) * DAY - index * 3_600_000).toISOString(),
      author_name: `${FAMILY_NAMES[(seed + index) % FAMILY_NAMES.length]}*${GIVEN_NAMES[(Math.floor(seed / 11) + index * 7) % GIVEN_NAMES.length]}`,
      source_url: null,
      is_generated: true,
    }));
  });
  const products = source.map((p) => {
    const productReviews = reviews.filter((r) => r.product_id === id(`product:${p.id}`));
    return {
      id: id(`product:${p.id}`),
      name: p.name,
      description: `${p.name}\n\n${CATEGORY_COPY[p.category]}`,
      price: p.price,
      sale_price: null,
      image_url: p.imageUrl,
      detail_image_urls: p.images,
      status: "registered",
      categories: ["의류", p.category, p.gender],
      additional_info: {
        브랜드: p.brand,
        상품유형: p.category,
        권장스타일: "데일리 · 캐주얼 · 출근룩",
        소재및혼용률: "원본 상품의 케어 라벨 확인이 필요합니다.",
        세탁안내: "제품별 케어 라벨을 확인한 후 세탁해 주세요. 진한 색상은 단독 세탁을 권장합니다.",
        색상안내: "색상은 상세 이미지에서 확인해 주세요. 화면 설정에 따라 차이가 있을 수 있습니다.",
        원본상품명: p.originalTitle,
        상품정보출처: p.sourceUrl,
      },
      measurements: "사이즈 선택: 평소 잘 맞는 옷의 실측과 비교해 주세요.\n핏 안내: 상품 사진의 실루엣과 기장을 함께 확인해 주세요.\n실측 정보: 원본 자료에 없는 치수는 임의로 기재하지 않았습니다.",
      rating_average: Number((productReviews.reduce((sum, r) => sum + r.rating, 0) / productReviews.length).toFixed(2)),
      review_summary: { count: productReviews.length, highlight: REVIEW_COPY[p.category][Number(p.id) % REVIEW_COPY[p.category].length] },
      created_at: new Date(CATALOG_DATE - (200 + Number(p.id) % 60) * DAY).toISOString(),
    };
  });
  return { products, reviews };
}

async function main() {
  const source: SourceProduct[] = JSON.parse(await readFile(join(process.cwd(), "scripts/data/fashion-products.json"), "utf8"));
  assert.equal(source.length, 180);
  assert.equal(new Set(source.map((p) => p.id)).size, source.length);
  assert.equal(new Set(source.map((p) => p.imageUrl)).size, source.length);
  for (const p of source) {
    assert.ok(p.category in REVIEW_COPY && /[가-힣]/.test(p.name));
    assert.ok(Number.isFinite(p.price) && p.price >= 5000 && Number.isInteger(p.price));
    assert.ok(p.images.length > 0);
    for (const image of [p.imageUrl, ...p.images]) {
      assert.equal(new URL(image).origin, "https://shopping-phinf.pstatic.net");
    }
  }
  const { products, reviews } = buildCatalog(source);
  assert.ok(reviews.length >= 2500);
  assert.equal(new Set(reviews.map((r) => r.id)).size, reviews.length);
  assert.ok(reviews.every((r) => /[가-힣]/.test(r.content) && r.rating >= 2 && r.rating <= 5));
  assert.ok(reviews.every((r) => r.user_id === null && r.order_id === null && r.is_generated));
  for (const category of Object.keys(REVIEW_COPY)) {
    assert.equal(source.filter((p) => p.category === category).length, 30);
  }
  if (process.argv.includes("--check")) {
    console.log(`검증 통과: 의류 ${products.length}개, 고유 대표 사진 ${source.length}장, 한국어 리뷰 ${reviews.length}개`);
    return;
  }

  const token = process.env.SUPABASE_ACCESS_TOKEN;
  const ref = getProjectRefFromSupabaseUrl(process.env.NEXT_PUBLIC_SUPABASE_URL ?? "");
  if (!token || !ref) throw new Error("SUPABASE_ACCESS_TOKEN과 NEXT_PUBLIC_SUPABASE_URL이 필요합니다.");
  const reset = process.argv.includes("--reset-commerce");
  const refresh = process.argv.includes("--refresh-catalog");
  if (reset || refresh) {
    const backup: Record<string, unknown> = {};
    for (const table of [...TABLES, "users"]) {
      const rows = await managementDbExec(token, ref, `SELECT * FROM public.${table}`, true);
      if (!Array.isArray(rows)) throw new Error(`${table} 백업 응답이 올바르지 않습니다. 변경을 중단합니다.`);
      backup[table] = rows;
    }
    const directory = join(tmpdir(), "commerce-dashboard-backups");
    await mkdir(directory, { recursive: true, mode: 0o700 });
    const path = join(directory, `before-fashion-${Date.now()}.json`);
    await writeFile(path, JSON.stringify(backup), { mode: 0o600 });
    console.log(`변경 전 백업: ${path}`);
  }
  const statements = ["BEGIN;", "SET LOCAL statement_timeout = '30s';"];
  if (reset) statements.push(...TABLES.map((table) => `DELETE FROM public.${table};`));
  for (const migration of ["0022_imported_reviews.sql", "0023_composed_korean_reviews.sql", "0024_catalog_categories.sql", "0025_product_search_options.sql", "0026_cart_selected_options.sql", "0027_storefront_departments.sql"]) {
    statements.push(await readFile(join(process.cwd(), "supabase/migrations", migration), "utf8"));
  }
  if (refresh) {
    const legacy = LEGACY_IDS.map((value) => `'${id(`product:${value}`)}'`).join(",");
    statements.push(
      `DELETE FROM public.reviews WHERE product_id IN (${legacy}) AND user_id IS NULL;`,
      `UPDATE public.products SET status = 'hidden' WHERE id IN (${legacy});`,
      `DELETE FROM public.products p WHERE p.id IN (${legacy}) AND NOT EXISTS (SELECT 1 FROM public.order_items oi WHERE oi.product_id = p.id);`,
    );
  }
  const productIds = products.map((p) => `'${p.id}'`).join(",");
  statements.push(
    insert("products", products, refresh),
    insert("reviews", reviews, refresh),
    `WITH totals AS (
      SELECT product_id, count(*) AS count, round(avg(rating), 2) AS rating
      FROM public.reviews WHERE product_id IN (${productIds}) GROUP BY product_id
    ) UPDATE public.products p SET rating_average = totals.rating,
      review_summary = coalesce(p.review_summary, '{}'::jsonb) || jsonb_build_object('count', totals.count)
      FROM totals WHERE p.id = totals.product_id;`,
    "COMMIT;",
  );
  await managementDbExec(token, ref, statements.join("\n"));
  const result = await managementDbExec(token, ref, "SELECT (SELECT count(*) FROM public.products WHERE status <> 'hidden') AS visible_products, (SELECT count(*) FROM public.reviews) AS reviews, (SELECT count(*) FROM public.payments) AS payments, (SELECT count(*) FROM public.orders) AS orders, (SELECT count(*) FROM public.users) AS users", true);
  console.log("적용 후 검증:", JSON.stringify(result));
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : "의류 데이터 적용 실패");
  process.exitCode = 1;
});
