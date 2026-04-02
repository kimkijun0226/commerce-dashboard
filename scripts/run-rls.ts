import { config } from "dotenv";
import { readFileSync } from "fs";
import { join } from "path";

config({ path: join(process.cwd(), ".env.local") });

const MIGRATIONS_DIR = join(process.cwd(), "supabase", "migrations");
const RLS_FILE = "0002_enable_rls_and_policies.sql";

function loadEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const accessToken = process.env.SUPABASE_ACCESS_TOKEN;
  const ref = process.env.SUPABASE_REFERENCE_ID;
  const projectRef = ref || (url ? url.replace(/https?:\/\//, "").split(".")[0] : null);
  if (!accessToken) {
    throw new Error(
      "SUPABASE_ACCESS_TOKEN이 필요합니다. Supabase 대시보드 → Account → Access Tokens에서 생성 후 .env.local에 넣으세요."
    );
  }
  if (!projectRef) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL 또는 SUPABASE_REFERENCE_ID가 필요합니다."
    );
  }
  return { accessToken, projectRef };
}

async function main() {
  const { accessToken, projectRef } = loadEnv();
  const filePath = join(MIGRATIONS_DIR, RLS_FILE);
  const sql = readFileSync(filePath, "utf-8");
  const managementUrl = `https://api.supabase.com/v1/projects/${projectRef}/database/query`;

  console.log("Management API 사용 (SUPABASE_ACCESS_TOKEN)");
  console.log(`실행 중: ${RLS_FILE}`);
  const response = await fetch(managementUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ query: sql }),
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`${RLS_FILE} 실행 실패: ${errorText}`);
  }
  console.log(`완료: ${RLS_FILE}`);
  console.log("RLS 마이그레이션 적용이 완료되었습니다.");
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("RLS 마이그레이션 오류:", err);
    process.exit(1);
  });
