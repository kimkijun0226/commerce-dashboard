import { config } from "dotenv";
import { readFileSync, readdirSync } from "fs";
import { join } from "path";
import {
  getProjectRefFromSupabaseUrl,
  managementDbExec,
  parseSelectStringColumn,
} from "./managementDbQuery";

config({ path: join(process.cwd(), ".env.local") });

const MIGRATIONS_DIR = join(process.cwd(), "supabase", "migrations");
const TRACKING_TABLE = "_schema_migrations";

/** 스키마는 이미 있는데 적용 이력만 없을 때(특히 0001 재실행) 복구용 */
function isAlreadyAppliedSchemaError(message: string): boolean {
  const m = message.toLowerCase();
  return (
    m.includes("42710") ||
    m.includes("42p07") ||
    m.includes("already exists")
  );
}

function loadEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const databaseUrl = process.env.DATABASE_URL;
  /** Supabase 대시보드 > Account > Access Tokens (Management API 전용, service_role 아님) */
  const accessToken = process.env.SUPABASE_ACCESS_TOKEN;
  if (!url) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL이 설정되지 않았습니다.");
  }
  if (!databaseUrl && !accessToken) {
    throw new Error(
      "마이그레이션 실행을 위해 DATABASE_URL 또는 SUPABASE_ACCESS_TOKEN 중 하나가 필요합니다. " +
        "SUPABASE_SECRET_KEY(service_role)는 Management API에서 인증되지 않습니다.",
    );
  }
  return { url, databaseUrl, accessToken };
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
      `SELECT name FROM public.${TRACKING_TABLE}`,
    );
    const appliedSet = new Set(
      (applied.rows as { name: string }[]).map((r) => r.name),
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
      try {
        await client.query(sql);
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (isAlreadyAppliedSchemaError(msg)) {
          console.warn(
            `${file}: DB에 객체가 이미 있어 적용 이력만 남기고 건너뜁니다. (스키마가 레포와 다르면 수동 확인 필요)`,
          );
        } else {
          throw e;
        }
      }
      await client.query(
        `INSERT INTO public.${TRACKING_TABLE} (name) VALUES ($1) ON CONFLICT (name) DO NOTHING`,
        [file],
      );
      appliedSet.add(file);
      console.log(`완료: ${file}`);
    }
    console.log("마이그레이션 적용이 완료되었습니다.");
  } finally {
    await client.end();
  }
}

async function runViaManagementApi(accessToken: string, projectRef: string) {
  const files = getMigrationFiles();
  if (files.length === 0) {
    console.log("실행할 마이그레이션이 없습니다.");
    return;
  }

  await managementDbExec(
    accessToken,
    projectRef,
    `CREATE TABLE IF NOT EXISTS public.${TRACKING_TABLE} (
      name text PRIMARY KEY,
      executed_at timestamptz NOT NULL DEFAULT now()
    );`,
    false,
  );

  const appliedRaw = await managementDbExec(
    accessToken,
    projectRef,
    `SELECT name FROM public.${TRACKING_TABLE}`,
    true,
  );
  const appliedSet = new Set(parseSelectStringColumn(appliedRaw, "name"));

  for (const file of files) {
    if (appliedSet.has(file)) {
      console.log(`건너뜀 (이미 적용됨): ${file}`);
      continue;
    }
    const sql = readFileSync(join(MIGRATIONS_DIR, file), "utf-8");
    console.log(`실행 중: ${file}`);
    try {
      await managementDbExec(accessToken, projectRef, sql, false);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      if (isAlreadyAppliedSchemaError(msg)) {
        console.warn(
          `${file}: DB에 객체가 이미 있어 적용 이력만 남기고 건너뜁니다. (스키마가 레포와 다르면 수동 확인 필요)`,
        );
      } else {
        throw e;
      }
    }
    const esc = file.replace(/'/g, "''");
    await managementDbExec(
      accessToken,
      projectRef,
      `INSERT INTO public.${TRACKING_TABLE} (name) VALUES ('${esc}') ON CONFLICT (name) DO NOTHING`,
      false,
    );
    appliedSet.add(file);
    console.log(`완료: ${file}`);
  }
  console.log("마이그레이션 적용이 완료되었습니다.");
}

async function main() {
  const { url, databaseUrl, accessToken } = loadEnv();
  const projectRef = getProjectRefFromSupabaseUrl(url);

  if (databaseUrl) {
    console.log("DATABASE_URL 사용 (적용 이력 확인 후 미적용분만 실행)");
    await runViaPg(databaseUrl);
    return;
  }

  if (accessToken && projectRef) {
    console.log(
      "Management API 사용 (SUPABASE_ACCESS_TOKEN, _schema_migrations 기준으로 미적용분만 실행)",
    );
    await runViaManagementApi(accessToken, projectRef);
    return;
  }

  if (accessToken && !projectRef) {
    throw new Error(
      "Management API는 NEXT_PUBLIC_SUPABASE_URL에서 프로젝트 ref를 읽어야 합니다. " +
        "예: https://abcdefghij.supabase.co 또는 Supabase 대시보드의 DATABASE_URL을 .env.local에 넣어 주세요.",
    );
  }

  throw new Error(
    "DATABASE_URL(Postgres 연결 문자열) 또는 SUPABASE_ACCESS_TOKEN + supabase.co URL이 필요합니다.",
  );
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("마이그레이션 오류:", err);
    process.exit(1);
  });
