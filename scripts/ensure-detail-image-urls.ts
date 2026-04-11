/**
 * Supabase `products`에 `detail_image_urls` 컬럼이 없을 때만 추가하고,
 * 메인 이미지가 있는데 상세 배열이 비어 있으면 1장으로 채웁니다.
 *
 * 필요: .env.local의 DATABASE_URL (Supabase 대시보드 > Project Settings > Database > URI)
 */
import { config } from "dotenv";
import { join } from "path";

config({ path: join(process.cwd(), ".env.local") });

async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl?.trim()) {
    throw new Error(
      ".env.local에 DATABASE_URL을 넣으세요. (Supabase > Settings > Database > Connection string > URI)",
    );
  }

  const { Client } = await import("pg");
  const client = new Client({ connectionString: databaseUrl });
  await client.connect();

  try {
    await client.query(`
      ALTER TABLE public.products
        ADD COLUMN IF NOT EXISTS detail_image_urls text[] NOT NULL DEFAULT '{}';
    `);
    await client.query(`
      COMMENT ON COLUMN public.products.detail_image_urls IS '상품 상세정보 탭용 이미지 URL 배열';
    `);
    const upd = await client.query(`
      UPDATE public.products
      SET detail_image_urls = ARRAY[image_url]::text[]
      WHERE image_url IS NOT NULL
        AND cardinality(detail_image_urls) = 0;
    `);
    console.log(
      `detail_image_urls 컬럼 확인 완료. 메인 이미지로 채운 행: ${upd.rowCount ?? 0}개`,
    );
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
