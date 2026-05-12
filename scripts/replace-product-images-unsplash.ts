/**
 * `products.image_url` 을 `images.unsplash.com` (안정적) URL로 전부 교체합니다.
 * - 상품명 키워드 기반으로 카테고리 느낌이 맞는 이미지를 선택
 * - Unsplash API 키 없이도 동작 (고정 photo id 사용)
 *
 * 우선순위: .env.local 의 DATABASE_URL → 없으면 SUPABASE_ACCESS_TOKEN + NEXT_PUBLIC_SUPABASE_URL (Management API)
 */
import { config } from "dotenv";
import { join } from "path";
import { getProjectRefFromSupabaseUrl, managementDbExec } from "./managementDbQuery";

config({ path: join(process.cwd(), ".env.local") });

type Candidate = { match: RegExp; url: string };

function img(url: string) {
  // Next/Image 최적화에 유리한 파라미터
  const base = url.split("?")[0] ?? url;
  return `${base}?w=800&h=960&fit=crop&crop=center&q=80&auto=format`;
}

const CANDIDATES: Candidate[] = [
  { match: /이어폰|헤드폰|스피커|오디오/i, url: img("https://images.unsplash.com/photo-1505740420928-5e560c06d30e") },
  { match: /스마트워치|워치|웨어러블/i, url: img("https://images.unsplash.com/photo-1523275335684-37898b6baf30") },
  { match: /키보드/i, url: img("https://images.unsplash.com/photo-1515879218367-8466d910aaa4") },
  { match: /마우스/i, url: img("https://images.unsplash.com/photo-1527814050087-3793815479db") },
  { match: /웹캠|카메라/i, url: img("https://images.unsplash.com/photo-1587825140400-9a202f6f86bb") },
  { match: /보조배터리|배터리|충전/i, url: img("https://images.unsplash.com/photo-1580915411954-282cb1b0d780") },
  { match: /러닝화|운동화|슈즈|신발/i, url: img("https://images.unsplash.com/photo-1542291026-7eec264c27ff") },
  { match: /자전거|바이크/i, url: img("https://images.unsplash.com/photo-1511994298241-608e28f14fde") },
  { match: /케틀벨|덤벨|웨이트|헬스/i, url: img("https://images.unsplash.com/photo-1583454110551-21f2fa2afe61") },
  { match: /줄넘기/i, url: img("https://images.unsplash.com/photo-1517964108460-8888d7d49b58") },
  { match: /가방|백팩|토트|숄더/i, url: img("https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f") },
  { match: /지갑|카드/i, url: img("https://images.unsplash.com/photo-1524592094714-0f0654e20314") },
  { match: /티셔츠|후드|자켓|의류|셔츠/i, url: img("https://images.unsplash.com/photo-1520975958225-35b29b3fa74a") },
  { match: /모자|캡/i, url: img("https://images.unsplash.com/photo-1521369909029-2afed882baee") },
  { match: /선글라스|안경/i, url: img("https://images.unsplash.com/photo-1511499767150-a48a237f0083") },
];

const FALLBACKS = [
  img("https://images.unsplash.com/photo-1605902711622-cfb43c4437b2"),
  img("https://images.unsplash.com/photo-1523275335684-37898b6baf30"),
  img("https://images.unsplash.com/photo-1515879218367-8466d910aaa4"),
];

function pickUrl(name: string) {
  for (const c of CANDIDATES) {
    if (c.match.test(name)) return c.url;
  }
  // 간단 해시로 fallback 분산
  let h = 0;
  for (let i = 0; i < name.length; i += 1) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return FALLBACKS[h % FALLBACKS.length]!;
}

async function updateViaManagementApi(accessToken: string, projectRef: string) {
  const rows = (await managementDbExec(
    accessToken,
    projectRef,
    `SELECT id, name FROM public.products ORDER BY created_at DESC;`,
    true,
  )) as unknown;

  if (!Array.isArray(rows)) {
    throw new Error("Management API 응답 형식이 예상과 다릅니다.");
  }

  const updates = rows
    .map((r) => {
      const o = r as { id?: unknown; name?: unknown };
      const id = String(o.id ?? "");
      const name = String(o.name ?? "");
      if (!id || !name) return "";
      const url = pickUrl(name).replace(/'/g, "''");
      const safeId = id.replace(/'/g, "''");
      return `UPDATE public.products SET image_url = '${url}', updated_at = now() WHERE id = '${safeId}';`;
    })
    .filter(Boolean)
    .join("\n");

  await managementDbExec(accessToken, projectRef, updates, false);
  console.log("Unsplash 이미지로 교체 완료.");
}

async function main() {
  const accessToken = process.env.SUPABASE_ACCESS_TOKEN?.trim();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const projectRef = getProjectRefFromSupabaseUrl(supabaseUrl);
  if (!accessToken || !projectRef) {
    throw new Error("SUPABASE_ACCESS_TOKEN / NEXT_PUBLIC_SUPABASE_URL 설정이 필요합니다.");
  }
  await updateViaManagementApi(accessToken, projectRef);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

