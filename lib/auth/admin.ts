// 현재 로그인 세션이 관리자 권한을 가졌는지 서버에서 확인합니다.
import { createClient } from "@/lib/supabase/server";

/**
 * 현재 세션 사용자가 관리자(`users.role === 'admin'`)인지 확인합니다.
 */
export async function checkAdminAccess(): Promise<boolean> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
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
}
