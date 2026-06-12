// 서버에서만 쓰는 service_role 클라이언트를 필요할 때 생성합니다.
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import { getPublicEnv } from "@/commons/config/env";
import type { Database } from "@/types/supabase";

/**
 * 서버 전용 `service_role` 클라이언트 (RLS 우회).
 * `SUPABASE_SECRET_KEY`가 없으면 `null`을 반환합니다.
 */
export function createServiceRoleSupabaseClient(): SupabaseClient<
  Database,
  "public"
> | null {
  const key = process.env.SUPABASE_SECRET_KEY?.trim();
  if (!key) return null;
  const { supabase } = getPublicEnv();
  return createClient<Database, "public">(supabase.url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
    db: { schema: "public" },
  });
}
