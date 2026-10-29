import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { config } from "dotenv";
import { getProjectRefFromSupabaseUrl, managementDbExec } from "./managementDbQuery";
config({ path: ".env.local", quiet: true });

type Source = { id: string; department: "beauty" | "home"; name: string; brand: string; category: string; price: number; imageUrl: string; images: string[]; sourceUrl: string; originalTitle: string; available: boolean; selectedVariant: string; options: { name: string; values: string[]; required: boolean }[] };
async function main() {
  const sources: Source[] = JSON.parse(await readFile(join(process.cwd(), "scripts/data/oveon-lifestyle-products.json"), "utf8"));
  assert.equal(new Set(sources.map(p => p.id)).size, sources.length);
  for (const p of sources) { assert(p.price > 0 && p.name && p.images.length); assert.equal(new URL(p.imageUrl).protocol, "https:"); }
  const token = process.env.SUPABASE_ACCESS_TOKEN;
  const ref = getProjectRefFromSupabaseUrl(process.env.NEXT_PUBLIC_SUPABASE_URL ?? "");
  assert(token && ref, "Supabase Management API credentials are required");
  const migration = "0027_storefront_departments.sql";
  const sql = await readFile(join(process.cwd(), "supabase/migrations", migration), "utf8");
  const rows = sources.map((p, index) => ({
    id: p.id, department: p.department, name: p.name, price: p.price, sale_price: null,
    image_url: p.imageUrl, detail_image_urls: p.images,
    status: p.available ? "registered" : "sold_out",
    categories: [p.department === "beauty" ? "뷰티" : "홈", p.category],
    search_keywords: [p.brand, p.name, p.category, p.originalTitle, ...(p.department === "beauty" ? ["화장품", "스킨케어", "COSRX"] : ["가구", "인테리어", "Ferm Living"])],
    description: p.department === "beauty"
      ? `${p.brand}의 ${p.name}입니다. 나를 돌보는 일상에 맞춰 선택해 보세요. 전성분, 사용 방법, 사용 시 주의사항은 제품 표시와 공식 상품 안내를 확인해 주세요.`
      : `${p.brand}의 ${p.name}입니다. 소재와 실루엣으로 공간의 분위기를 완성해 보세요. 정확한 치수와 소재, 관리 방법은 공식 상품 안내에서 확인해 주세요.`,
    additional_info: { 브랜드: p.brand, 상품유형: p.category, 원본상품명: p.originalTitle, 판매구성: p.selectedVariant, 상품정보출처: p.sourceUrl, 가격안내: "오브온 등록 판매가격이며 원본 판매처 가격과 다를 수 있습니다." },
    measurements: p.department === "beauty" ? "용량과 구성은 제품 표시 및 공식 상품 안내를 확인해 주세요." : "설치 공간과 동선을 확인한 후 공식 상품 안내의 실측을 비교해 주세요.",
    review_summary: { count: 0, highlight: "" }, options: p.options,
    created_at: new Date(Date.UTC(2026, 9, 29, 0, 0, index)).toISOString(),
  }));
  const json = JSON.stringify(rows).replaceAll("'", "''");
  const cols = Object.keys(rows[0]).join(",");
  const result = await managementDbExec(token, ref, `BEGIN; ${sql}
    INSERT INTO public.products (${cols}) SELECT ${cols} FROM jsonb_populate_recordset(NULL::public.products, '${json}'::jsonb) ON CONFLICT (id) DO NOTHING;
    INSERT INTO public._schema_migrations(name) VALUES ('${migration}') ON CONFLICT (name) DO NOTHING;
    COMMIT;
    SELECT department, count(*) FROM public.products GROUP BY department ORDER BY department;`);
  console.log(JSON.stringify(result));
}
main().catch(error => { console.error(error); process.exitCode = 1; });
