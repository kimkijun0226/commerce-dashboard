// lib/supabase/browser.ts
// 브라우저 전용: createBrowserClient는 쿠키 기반 세션 + 브라우저에서 autoRefreshToken·PKCE를 기본 적용

import { createBrowserClient } from "@supabase/auth-helpers-nextjs";
import { getPublicEnv } from "@/commons/config/env";
import type { Database } from "@/types/supabase";

export function createClient() {
  const { supabase } = getPublicEnv();
  return createBrowserClient<Database>(
    supabase.url,
    supabase.publishableKey,
  );
}
