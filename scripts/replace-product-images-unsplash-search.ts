/**
 * Unsplash Search API로 상품명/카테고리 기반 이미지를 찾아 `products.image_url`을 갱신합니다.
 *
 * - `--pick=2` (기본): 검색 결과 2번째 이미지를 선택(없으면 1번째로 fallback)
 * - API Key 필요: `.env.local`에 `UNSPLASH_ACCESS_KEY` 추가
 *
 * 우선순위: SUPABASE_ACCESS_TOKEN + NEXT_PUBLIC_SUPABASE_URL (Management API)
 */
import { config } from "dotenv";
import { join } from "path";
import { getProjectRefFromSupabaseUrl, managementDbExec } from "./managementDbQuery";

config({ path: join(process.cwd(), ".env.local") });

type UnsplashSearchResponse = {
  results: Array<{
    id: string;
    urls: { raw: string };
  }>;
};

function argPickIndex() {
  const raw = process.argv.find((a) => a.startsWith("--pick="))?.split("=")[1];
  const n = Number(raw ?? "2") || 2;
  return Math.max(1, Math.floor(n));
}

function argOnlyNames(): string[] | null {
  const raw = process.argv.find((a) => a.startsWith("--only="))?.split("=")[1];
  if (!raw) return null;
  const decoded = decodeURIComponent(raw);
  const names = decoded
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  return names.length > 0 ? names : null;
}

function withImageParams(raw: string) {
  const u = new URL(raw);
  u.searchParams.set("w", "800");
  u.searchParams.set("h", "960");
  u.searchParams.set("fit", "crop");
  u.searchParams.set("crop", "center");
  u.searchParams.set("q", "80");
  u.searchParams.set("auto", "format");
  return u.toString();
}

function buildQuery(name: string, categories: string[] | null) {
  const n = name ?? "";
  // 한국어 상품명은 검색 결과가 흔들릴 수 있어서, 강하게 영어 키워드로 보정
  if (/요가\s*매트/i.test(n)) return "yoga mat product";
  if (/플리스/i.test(n)) return "fleece sweatshirt product";
  if (/보조배터리|배터리/i.test(n)) return "power bank product";
  if (/이어폰/i.test(n)) return "wireless earbuds product";
  if (/헤드폰/i.test(n)) return "noise cancelling headphones product";
  if (/스피커/i.test(n)) return "bluetooth speaker product";
  if (/키보드/i.test(n)) return "mechanical keyboard product";
  if (/마우스/i.test(n)) return "wireless mouse product";
  if (/웹캠/i.test(n)) return "webcam product";
  if (/러닝화|운동화|신발/i.test(n)) return "running shoes product";
  if (/자전거|바이크/i.test(n)) return "exercise bike product";
  if (/케틀벨|덤벨/i.test(n)) return "kettlebell product";
  if (/줄넘기/i.test(n)) return "jump rope product";
  if (/가방|백팩/i.test(n)) return "bag product";
  if (/지갑/i.test(n)) return "wallet product";
  if (/티셔츠|후드|자켓|셔츠|의류/i.test(n)) return "clothing product";

  const c = categories?.join(" ") ?? "";
  if (c.includes("전자제품")) return `electronics product ${n}`;
  if (c.includes("운동용품")) return `fitness product ${n}`;
  if (c.includes("가방")) return `bag product ${n}`;
  if (c.includes("의류")) return `clothing product ${n}`;

  return `${n} product`;
}

async function searchUnsplash(accessKey: string, query: string, perPage = 5) {
  const url = new URL("https://api.unsplash.com/search/photos");
  url.searchParams.set("query", query);
  url.searchParams.set("per_page", String(perPage));
  url.searchParams.set("orientation", "portrait");

  const res = await fetch(url.toString(), {
    headers: { Authorization: `Client-ID ${accessKey}` },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Unsplash 검색 실패: HTTP ${res.status} ${text}`);
  }
  return (await res.json()) as UnsplashSearchResponse;
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function main() {
  const accessToken = process.env.SUPABASE_ACCESS_TOKEN?.trim();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const projectRef = getProjectRefFromSupabaseUrl(supabaseUrl);
  const unsplashKey = process.env.UNSPLASH_ACCESS_KEY?.trim();
  const pick = argPickIndex(); // 2 => 2번째 결과
  const onlyNames = argOnlyNames();

  if (!accessToken || !projectRef) {
    throw new Error("SUPABASE_ACCESS_TOKEN / NEXT_PUBLIC_SUPABASE_URL 설정이 필요합니다.");
  }
  if (!unsplashKey) {
    throw new Error(
      "UNSPLASH_ACCESS_KEY가 없습니다. `.env.local`에 UNSPLASH_ACCESS_KEY=<your_key> 를 추가해 주세요.",
    );
  }

  const rows = (await managementDbExec(
    accessToken,
    projectRef,
    `SELECT id, name, categories FROM public.products ORDER BY created_at DESC;`,
    true,
  )) as unknown;

  if (!Array.isArray(rows)) {
    throw new Error("Management API 응답 형식이 예상과 다릅니다.");
  }

  let updated = 0;
  for (const r of rows) {
    const o = r as { id?: unknown; name?: unknown; categories?: unknown };
    const id = String(o.id ?? "");
    const name = String(o.name ?? "");
    const categories = Array.isArray(o.categories)
      ? o.categories.map((x) => String(x))
      : null;
    if (!id || !name) continue;
    if (onlyNames && !onlyNames.some((t) => name.includes(t))) continue;

    const query = buildQuery(name, categories);
    const result = await searchUnsplash(unsplashKey, query, Math.max(3, pick + 1));
    const index = Math.min(pick - 1, result.results.length - 1);
    const chosen = result.results[index] ?? result.results[0];
    if (!chosen) continue;

    const imageUrl = withImageParams(chosen.urls.raw).replace(/'/g, "''");
    const safeId = id.replace(/'/g, "''");
    const sql = `UPDATE public.products SET image_url = '${imageUrl}', updated_at = now() WHERE id = '${safeId}';`;
    await managementDbExec(accessToken, projectRef, sql, false);
    updated += 1;

    // 레이트리밋 완화용 소량 딜레이
    await sleep(160);
  }

  console.log(
    `Unsplash 검색 기반 image_url 업데이트 완료: ${updated}개 (pick=${pick})${
      onlyNames ? ` (only=${onlyNames.join(",")})` : ""
    }`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

