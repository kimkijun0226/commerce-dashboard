/**
 * Supabase `products`에 `detail_image_urls` 컬럼이 없을 때만 추가하고,
 * 메인 이미지가 있는데 상세 배열이 비어 있으면 1장으로 채웁니다.
 *
 * 우선순위: .env.local 의 DATABASE_URL → 없으면 SUPABASE_ACCESS_TOKEN + NEXT_PUBLIC_SUPABASE_URL (Management API)
 */
import { config } from "dotenv";
import { join } from "path";
import {
  getProjectRefFromSupabaseUrl,
  managementDbExec,
} from "./managementDbQuery";

config({ path: join(process.cwd(), ".env.local") });

const SQL_ADD = `
  ALTER TABLE public.products
    ADD COLUMN IF NOT EXISTS detail_image_urls text[] NOT NULL DEFAULT '{}';
`;

const SQL_COMMENT = `
  COMMENT ON COLUMN public.products.detail_image_urls IS '상품 상세정보 탭용 이미지 URL 배열';
`;

const SQL_BACKFILL = `
  UPDATE public.products
  SET detail_image_urls = ARRAY[image_url]::text[]
  WHERE image_url IS NOT NULL
    AND cardinality(detail_image_urls) = 0;
`;

async function main() {
  const databaseUrl = process.env.DATABASE_URL?.trim();
  const accessToken = process.env.SUPABASE_ACCESS_TOKEN?.trim();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";

  if (databaseUrl) {
    const { Client } = await import("pg");
    const client = new Client({ connectionString: databaseUrl });
    await client.connect();
    try {
      await client.query(SQL_ADD);
      await client.query(SQL_COMMENT);
      const upd = await client.query(SQL_BACKFILL);
      console.log(
        `detail_image_urls 컬럼 확인 완료. 메인 이미지로 채운 행: ${upd.rowCount ?? 0}개`,
      );
    } finally {
      await client.end();
    }
    return;
  }

  const projectRef = getProjectRefFromSupabaseUrl(supabaseUrl);
  if (accessToken && projectRef) {
    await managementDbExec(accessToken, projectRef, SQL_ADD, false);
    await managementDbExec(accessToken, projectRef, SQL_COMMENT, false);
    await managementDbExec(accessToken, projectRef, SQL_BACKFILL, false);
    console.log(
      "detail_image_urls 컬럼 확인 완료 (Management API). 메인 이미지 백필은 실행됨.",
    );
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
