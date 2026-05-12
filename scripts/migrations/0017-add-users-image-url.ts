import { config } from "dotenv";
import { readFileSync } from "fs";
import { join } from "path";
import { getProjectRefFromSupabaseUrl, managementDbExec } from "../managementDbQuery";

config({ path: join(process.cwd(), ".env.local") });

function mustGetEnv(name: string): string {
  const v = process.env[name]?.trim();
  if (!v) throw new Error(`${name}이(가) 설정되지 않았습니다.`);
  return v;
}

async function main() {
  const url = mustGetEnv("NEXT_PUBLIC_SUPABASE_URL");

  // 이 프로젝트는 Supabase Management API 인증에 SUPABASE_ACCESS_TOKEN을 사용합니다.
  // (SUPABASE_SECRET_KEY(service_role)는 Management API에 인증되지 않습니다.)
  const accessToken =
    process.env.SUPABASE_ACCESS_TOKEN?.trim() || process.env.SUPABASE_SECRET_KEY?.trim();
  if (!accessToken) {
    throw new Error(
      "SUPABASE_ACCESS_TOKEN이 필요합니다. (SUPABASE_SECRET_KEY만으로는 Management API 인증이 되지 않을 수 있습니다.)",
    );
  }

  const projectRef = getProjectRefFromSupabaseUrl(url);
  if (!projectRef) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL에서 프로젝트 ref를 추출하지 못했습니다. 예: https://xxxx.supabase.co",
    );
  }

  const sqlPath = join(process.cwd(), "supabase", "migrations", "0017_users_image_url.sql");
  const sql = readFileSync(sqlPath, "utf-8");

  console.log("실행 중: 0017_users_image_url.sql");
  await managementDbExec(accessToken, projectRef, sql, false);
  console.log("완료: public.users.image_url 컬럼 추가");
  console.log("다음부터는 이 스크립트를 재실행하지 마세요. (중복 실행 방지)");
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("마이그레이션 오류:", msg);
    console.error("실행 방법: yarn db:add-users-image-url");
    process.exit(1);
  });

