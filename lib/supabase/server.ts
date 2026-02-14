// lib/supabase/server.ts
// 서버에서 사용하는 Supabase 클라이언트
// Server Component, API Route, Server Action에서 호출
// 브라우저는 localStorage가 없으므로 cookies로 세션 공유

import { createServerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { getPublicEnv } from "@/commons/config/env";
import type { Database } from "@/types/supabase";

/**
 * 서버용 Supabase 클라이언트 생성
 * - 요청별로 새 인스턴스 (요청 간 격리)
 * - cookies로 세션 읽기·갱신 → 브라우저와 세션 동기화
 */
export async function createClient() {
  const cookieStore = await cookies();
  const { supabase } = getPublicEnv();
  return createServerClient<Database>(supabase.url, supabase.publishableKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          // 인증 세션 갱신 시 쿠키 업데이트
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Server Component에서 호출 시 set이 제한될 수 있음 (읽기 전용)
        }
      },
    },
  });
}
