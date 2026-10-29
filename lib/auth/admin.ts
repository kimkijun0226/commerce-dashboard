// 현재 로그인 세션이 관리자 권한을 가졌는지 서버에서 확인합니다.
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

/**
 * 현재 요청의 검증된 로그인 사용자를 재사용합니다.
 */
export const getAdminUser = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error) return null;
  return user;
});

// React cache is scoped to this server request, never shared across users.
export const checkAdminAccess = cache(
  async function checkAdminAccess(): Promise<boolean> {
    const supabase = await createClient();
    const user = await getAdminUser();
    if (!user) return false;

    const { data, error } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    if (error) {
      console.error("[checkAdminAccess]", error);
      return false;
    }

    return data?.role === "admin";
  },
);
