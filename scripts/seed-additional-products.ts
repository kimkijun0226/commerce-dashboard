import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { config } from "dotenv";
import {
  managementDbExec,
  getProjectRefFromSupabaseUrl,
} from "./managementDbQuery";
config({ path: ".env.local", quiet: true });
type Source = {
  key: string;
  department: "fashion" | "beauty" | "home";
  name: string;
  brand: string;
  category: string;
  price: number;
  imageUrl: string;
  images: string[];
  sourceUrl: string;
  originalTitle: string;
  selectedVariant: string;
  available: boolean;
};
const uuid = (key: string) => {
  const hash = createHash("sha256")
    .update(`oveon:additional:${key}`)
    .digest("hex");
  return `${hash.slice(0, 8)}-${hash.slice(8, 12)}-4${hash.slice(13, 16)}-a${hash.slice(17, 20)}-${hash.slice(20, 32)}`;
};
async function main() {
  const sources: Source[] = JSON.parse(
    await readFile("scripts/data/oveon-additional-products.json", "utf8"),
  );
  assert.equal(new Set(sources.map((p) => p.key)).size, sources.length);
  assert(sources.length >= 200);
  const ordered: Source[] = [];
  for (const store of ["fashion", "beauty", "home"]) {
    const groups = new Map<string, Source[]>();
    for (const p of sources.filter((p) => p.department === store)) {
      const group = groups.get(p.category) ?? [];
      group.push(p);
      groups.set(p.category, group);
    }
    while ([...groups.values()].some((g) => g.length)) {
      for (const g of groups.values()) {
        const p = g.shift();
        if (p) ordered.push(p);
      }
    }
  }
  const now = Date.now();
  const rows = ordered.map((p, index) => {
    assert(
      p.price > 0 &&
        p.name &&
        p.images.length &&
        p.imageUrl.startsWith("https://"),
    );
    const tags = [p.brand, p.category, p.name, p.originalTitle];
    if (p.department === "fashion") {
      if (p.category === "스커트") {
        tags.push("치마");
        if (/롱|맥시/.test(p.name))
          tags.push("롱", "롱 스커트", "롱 치마", "맥시 스커트");
      }
      if (/스웻|스웨트|트레이닝|조거/.test(p.name) && /팬츠|바지/.test(p.name))
        tags.push("스웻 팬츠", "스웨트 팬츠", "트레이닝 바지", "sweat pants");
      if (/코튼|면 /.test(p.name)) tags.push("코튼");
    } else if (p.department === "beauty") {
      tags.push("화장품", "스킨케어", "COSRX");
      if (["크림", "세럼·앰플"].includes(p.category)) tags.push("보습");
    } else tags.push("가구", "인테리어", "Ferm Living");
    return {
      id: uuid(p.key),
      department: p.department,
      name: p.name,
      price: p.price,
      sale_price: null,
      status: p.available ? "registered" : "sold_out",
      image_url: p.imageUrl,
      detail_image_urls: p.images,
      categories: [p.category],
      search_keywords: [...new Set(tags)],
      options: [],
      description: `${p.brand} ${p.name}\n\n제품 구성과 소재·용량·관리 방법은 상품 표시 및 공식 상품 안내를 확인해 주세요.`,
      additional_info: {
        브랜드: p.brand,
        상품유형: p.category,
        원본상품명: p.originalTitle,
        판매구성: p.selectedVariant,
        상품정보출처: p.sourceUrl,
        가격안내:
          "오브온 등록 판매가격이며 원본 판매처 가격과 다를 수 있습니다.",
      },
      review_summary: { count: 0, highlight: "" },
      created_at: new Date(now - index * 1000).toISOString(),
    };
  });
  const cols = Object.keys(rows[0]).join(",");
  const sql = `BEGIN; INSERT INTO public.products (${cols}) SELECT ${cols} FROM jsonb_populate_recordset(NULL::public.products,'${JSON.stringify(rows).replaceAll("'", "''")}'::jsonb) ON CONFLICT (id) DO NOTHING;
    UPDATE public.products SET search_keywords=ARRAY(SELECT DISTINCT unnest(search_keywords||ARRAY['보습'])) WHERE department='beauty' AND (categories&&ARRAY['크림','세럼·앰플']) AND NOT ('보습'=ANY(search_keywords)); COMMIT;
    SELECT department,count(*) FROM public.products GROUP BY department ORDER BY department;`;
  const token = process.env.SUPABASE_ACCESS_TOKEN;
  const ref = getProjectRefFromSupabaseUrl(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
  );
  assert(token && ref);
  console.log(await managementDbExec(token, ref, sql));
}
main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
