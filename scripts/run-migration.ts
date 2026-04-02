import { config } from "dotenv";
import { readFileSync, readdirSync } from "fs";
import { join } from "path";

config({ path: join(process.cwd(), ".env.local") });

const MIGRATIONS_DIR = join(process.cwd(), "supabase", "migrations");
const TRACKING_TABLE = "_schema_migrations";

function loadEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secretKey = process.env.SUPABASE_SECRET_KEY;
  const databaseUrl = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL이 설정되지 않았습니다.");
  }
  if (!secretKey && !databaseUrl) {
    throw new Error("SUPABASE_SECRET_KEY 또는 DATABASE_URL이 필요합니다.");
  }
  return { url, secretKey, databaseUrl };
}

function getMigrationFiles(): string[] {
  try {
    return readdirSync(MIGRATIONS_DIR)
      .filter((f) => f.endsWith(".sql"))
      .sort();
  } catch {
    return [];
  }
}

function getProjectRef(url: string): string | null {
  const m = url?.match(/https?:\/\/([^.]+)\.supabase\.co/);
  return m ? m[1] : null;
}

async function runViaPg(databaseUrl: string) {
  const { Client } = await import("pg");
  const client = new Client({ connectionString: databaseUrl });
  await client.connect();

  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.${TRACKING_TABLE} (
        name text PRIMARY KEY,
        executed_at timestamptz NOT NULL DEFAULT now()
      )
    `);

    const applied = await client.query(
      `SELECT name FROM public.${TRACKING_TABLE}`
    );
    const appliedSet = new Set(
      (applied.rows as { name: string }[]).map((r) => r.name)
    );

    const files = getMigrationFiles();
    if (files.length === 0) {
      console.log("실행할 마이그레이션이 없습니다.");
      return;
    }

    for (const file of files) {
      if (appliedSet.has(file)) {
        console.log(`건너뜀 (이미 적용됨): ${file}`);
        continue;
      }
      const sql = readFileSync(join(MIGRATIONS_DIR, file), "utf-8");
      console.log(`실행 중: ${file}`);
      await client.query(sql);
      await client.query(
        `INSERT INTO public.${TRACKING_TABLE} (name) VALUES ($1) ON CONFLICT (name) DO NOTHING`,
        [file]
      );
      appliedSet.add(file);
      console.log(`완료: ${file}`);
    }
    console.log("마이그레이션 적용이 완료되었습니다.");
  } finally {
    await client.end();
  }
}

async function runViaManagementApi(secretKey: string, projectRef: string) {
  const files = getMigrationFiles();
  if (files.length === 0) {
    console.log("실행할 마이그레이션이 없습니다.");
    return;
  }

  const managementUrl = `https://api.supabase.com/v1/projects/${projectRef}/database/query`;

  for (const file of files) {
    const sql = readFileSync(join(MIGRATIONS_DIR, file), "utf-8");
    console.log(`실행 중: ${file}`);
    const response = await fetch(managementUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${secretKey}`,
      },
      body: JSON.stringify({ query: sql }),
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`${file} 실행 실패: ${errorText}`);
    }
    console.log(`완료: ${file}`);
  }
  console.log("마이그레이션 적용이 완료되었습니다.");
}

async function main() {
  const { url, secretKey, databaseUrl } = loadEnv();
  const projectRef = getProjectRef(url);

  if (databaseUrl) {
    console.log("DATABASE_URL 사용 (적용 이력 확인 후 미적용분만 실행)");
    await runViaPg(databaseUrl);
    return;
  }

  if (secretKey && projectRef) {
    console.log("Management API 사용 (모든 파일 실행, SQL은 재실행 방지 처리됨)");
    await runViaManagementApi(secretKey, projectRef);
    return;
  }

  throw new Error("DATABASE_URL 또는 SUPABASE_SECRET_KEY + NEXT_PUBLIC_SUPABASE_URL을 설정하세요.");
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("마이그레이션 오류:", err);
    process.exit(1);
  });
