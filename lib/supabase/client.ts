// lib/supabase/client.ts
// 브라우저(클라이언트)에서 사용하는 Supabase 클라이언트
// 'use client' 컴포넌트, 로그인 폼, React Query 등에서 호출

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { getPublicEnv } from "@/commons/config/env";
import type { Database } from "@/types/supabase";

// 싱글톤: 브라우저당 한 번만 생성, 재사용
let browserClient: SupabaseClient<Database, "public"> | null = null;

/**
 * 브라우저에서 Supabase 클라이언트를 반환
 * - localStorage 기반 세션 저장
 * - PKCE: Authorization Code 흐름으로 OAuth 보안 강화
 */
export function getSupabaseBrowserClient() {
  if (!browserClient) {
    const { supabase } = getPublicEnv();
    browserClient = createClient<Database, "public">(
      supabase.url,
      supabase.publishableKey,
      {
        auth: {
          persistSession: true, // 세션을 localStorage에 저장
          autoRefreshToken: true, // 토큰 만료 시 자동 갱신
          detectSessionInUrl: true, // 리다이렉트 후 URL에서 세션 파싱 (OAuth 등)
          flowType: "pkce", // 보안을 위한 PKCE 인증 흐름
        },
        db: {
          schema: "public", // 기본 스키마
        },
      },
    );
  }
  return browserClient;
}
