/**
 * Supabase `products.image_url` 를 Unsplash source URL로 업데이트합니다.
 *
 * - 기본: image_url 이 비어있는 상품만 업데이트
 * - `--all`: 모든 상품의 image_url 을 새 URL로 교체 (깨진 URL 복구 목적)
 *
 * 우선순위: .env.local 의 DATABASE_URL → 없으면 SUPABASE_ACCESS_TOKEN + NEXT_PUBLIC_SUPABASE_URL (Management API)
 */
import { config } from "dotenv";
import { join } from "path";
import { getProjectRefFromSupabaseUrl, managementDbExec } from "./managementDbQuery";

config({ path: join(process.cwd(), ".env.local") });

function toStablePlaceholderUrl(keyword: string) {
  const text = encodeURIComponent((keyword.trim() || "Product").slice(0, 24));
  // 리다이렉트/레이트리밋 이슈를 피하려고 placeholder 이미지로 고정
  return `https://placehold.co/800x960/png?text=${text}`;
}

function isAllMode() {
  return process.argv.includes("--all");
}

async function backfillViaDatabaseUrl(databaseUrl: string) {
  const { Client } = await import("pg");
  const client = new Client({ connectionString: databaseUrl });
  await client.connect();
  try {
    const allMode = isAllMode();
    const selectSql = `
      SELECT id, name
      FROM public.products
      ${allMode ? "" : "WHERE image_url IS NULL OR btrim(image_url) = ''"}
      ORDER BY created_at DESC;
    `;
    const { rows } = await client.query<{ id: string; name: string }>(selectSql);
    if (rows.length === 0) {
      console.log(
        allMode
          ? "업데이트할 상품이 없습니다. (products 테이블이 비어있음)"
          : "업데이트할 상품이 없습니다. (image_url 모두 존재)",
      );
      return;
    }

    let updated = 0;
    for (const r of rows) {
      const url = toStablePlaceholderUrl(r.name);
      const upd = await client.query(
        `UPDATE public.products SET image_url = $1, updated_at = now() WHERE id = $2;`,
        [url, r.id],
      );
      updated += upd.rowCount ?? 0;
    }
    console.log(
      `${allMode ? "image_url 교체" : "image_url 백필"} 완료: ${updated}개`,
    );
  } finally {
    await client.end();
  }
}

type UnknownRow = unknown;

function parseRows(data: unknown): UnknownRow[] {
  if (Array.isArray(data)) return data;
  if (!data || typeof data !== "object") return [];
  const o = data as Record<string, unknown>;
  const arr = (o.result ?? o.rows ?? o.data) as unknown;
  if (!Array.isArray(arr)) return [];
  return arr;
}

function parseIdNameRows(data: unknown): Array<{ id: string; name: string }> {
  const rows = parseRows(data);
  const out: Array<{ id: string; name: string }> = [];
  for (const row of rows) {
    if (row && typeof row === "object" && !Array.isArray(row)) {
      const r = row as Record<string, unknown>;
      const id = r.id;
      const name = r.name;
      if (id != null && name != null) out.push({ id: String(id), name: String(name) });
      continue;
    }
    if (Array.isArray(row) && row.length >= 2) {
      out.push({ id: String(row[0]), name: String(row[1]) });
    }
  }
  return out;
}

async function backfillViaManagementApi(accessToken: string, projectRef: string) {
  const allMode = isAllMode();
  const selectSql = `
    SELECT id, name
    FROM public.products
    ${allMode ? "" : "WHERE image_url IS NULL OR btrim(image_url) = ''"}
    ORDER BY created_at DESC;
  `;
  const data = await managementDbExec(accessToken, projectRef, selectSql, true);
  const rows = parseIdNameRows(data);
  if (rows.length === 0) {
    const preview = (() => {
      try {
        const s = JSON.stringify(data);
        if (!s) return "(empty)";
        return s.slice(0, 500);
      } catch {
        return "(unserializable)";
      }
    })();
    console.log(
      allMode
        ? "업데이트할 상품이 없습니다. (products 테이블이 비어있음)"
        : "업데이트할 상품이 없습니다. (image_url 모두 존재)",
    );
    console.log(`Management API 응답 파싱 실패 가능성. 미리보기: ${preview}`);
    return;
  }

  // Management API는 파라미터 바인딩이 어려워, 안전한 단순 문자열만 허용(escape)
  const updates = rows
    .map(({ id, name }) => {
      const safeId = String(id).replace(/'/g, "''");
      const url = toStablePlaceholderUrl(name).replace(/'/g, "''");
      return `UPDATE public.products SET image_url = '${url}', updated_at = now() WHERE id = '${safeId}';`;
    })
    .join("\n");

  await managementDbExec(accessToken, projectRef, updates, false);
  console.log(
    `${allMode ? "image_url 교체" : "image_url 백필"} 완료 (Management API): ${
      rows.length
    }개`,
  );
}

async function main() {
  const databaseUrl = process.env.DATABASE_URL?.trim();
  const accessToken = process.env.SUPABASE_ACCESS_TOKEN?.trim();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";

  if (databaseUrl) {
    await backfillViaDatabaseUrl(databaseUrl);
    return;
  }

  const projectRef = getProjectRefFromSupabaseUrl(supabaseUrl);
  if (accessToken && projectRef) {
    await backfillViaManagementApi(accessToken, projectRef);
    return;
  }

  throw new Error(
    ".env.local 에 DATABASE_URL 을 넣거나, SUPABASE_ACCESS_TOKEN + NEXT_PUBLIC_SUPABASE_URL 을 함께 넣으세요.",
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

