// commons/config/env.ts
// 환경변수 검증 및 공개/비공개 분리
// NEXT_PUBLIC_*: 빌드 시 클라이언트 번들에 포함 (브라우저 노출 가능)
// 그 외: 서버에서만 접근, 브라우저에 노출되지 않음

/** Supabase 연동에 필요한 환경변수 타입 */
export interface SupabaseEnv {
  url: string; // Supabase 프로젝트 URL
  publishableKey: string; // anon key (공개, RLS 적용)
  secretKey?: string; // service_role key (서버 전용, RLS 우회)
}

/** 브라우저·서버 모두 접근 가능한 환경변수 (secretKey 제외) */
export interface PublicEnv {
  supabase: Omit<SupabaseEnv, "secretKey">;
  siteUrl: string;
}

/** 서버 전용 환경변수 (Admin API 등 secretKey 필요 시) */
export interface ServerEnv extends PublicEnv {
  supabase: Required<SupabaseEnv>;
}

/** 필수 환경변수 검증, 없으면 즉시 에러 */
function validateEnvVar(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(
      `환경변수 ${name}이(가) 설정되지 않았습니다. .env.local 파일을 확인하세요.`,
    );
  }
  return value;
}

/**
 * 공개 환경변수 반환
 * - 브라우저와 서버 모두 호출 가능
 * - Supabase 클라이언트 초기화 시 사용
 */
export function getPublicEnv(): PublicEnv {
  const url = validateEnvVar(
    "NEXT_PUBLIC_SUPABASE_URL",
    process.env.NEXT_PUBLIC_SUPABASE_URL,
  );

  const publishableKey = validateEnvVar(
    "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  );
  return {
    supabase: {
      url,
      publishableKey,
    },
    siteUrl: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  };
}

/**
 * 서버 전용 환경변수 반환
 * - Admin API, RLS 우회 등 service_role 키가 필요할 때 사용
 * - 브라우저에서 절대 호출 금지 (secretKey 노출 위험)
 */
export function getServerEnv(): ServerEnv {
  const publicEnv = getPublicEnv();
  const secretKey = validateEnvVar(
    "SUPABASE_SECRET_KEY",
    process.env.SUPABASE_SECRET_KEY,
  );
  return {
    ...publicEnv,
    supabase: {
      ...publicEnv.supabase,
      secretKey,
    },
  };
}
