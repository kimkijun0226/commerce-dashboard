import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

import { getPublicEnv } from "@/commons/config/env";
import { AUTH_URLS, getRouteAccess } from "@/commons/constants/url";
import type { Database } from "@/types/supabase";

function isBypassPath(pathname: string) {
  return (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/images") ||
    pathname.startsWith("/icons") ||
    pathname === "/favicon.ico"
  );
}

export async function proxy(req: NextRequest) {
  const pathname = req.nextUrl.pathname;

  // 정적/예외 경로: early return
  if (isBypassPath(pathname)) {
    return NextResponse.next();
  }

  // 기본 응답
  let res = NextResponse.next({
    request: { headers: req.headers },
  });

  // Supabase 클라이언트 생성 (cookie 기반)
  const { supabase } = getPublicEnv();
  const supabaseClient = createServerClient<Database>(
    supabase.url,
    supabase.publishableKey,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            res.cookies.set(name, value, options);
          });
        },
      },
    },
  );

  // 사용자 인증 확인
  const {
    data: { user },
  } = await supabaseClient.auth.getUser();
  const isAuthed = Boolean(user);

  // 접근 정책 결정
  const access = getRouteAccess(pathname);
  const isGuestOnly = pathname === AUTH_URLS.LOGIN || pathname === AUTH_URLS.SIGNUP;
  const isMemberOnly = access === "authenticated";
  const isSuperAdminOnly = access === "admin";

  // guest-only: 로그인 상태면 홈으로
  if (isAuthed && isGuestOnly) {
    const url = req.nextUrl.clone();
    url.pathname = "/";
    url.search = "";
    return NextResponse.redirect(url);
  }

  // member-only: 미로그인 상태면 로그인으로
  if (!isAuthed && isMemberOnly) {
    const url = req.nextUrl.clone();
    url.pathname = AUTH_URLS.LOGIN;
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  // super-admin-only: admin 아니면 홈으로
  if (isAuthed && isSuperAdminOnly) {
    const { data } = await supabaseClient
      .from("users")
      .select("role")
      .eq("id", user!.id)
      .maybeSingle();

    if (data?.role !== "admin") {
      const url = req.nextUrl.clone();
      url.pathname = "/";
      url.search = "";
      return NextResponse.redirect(url);
    }
  }

  return res;
}

export const config = {
  matcher: [
    // API routes / 정적 파일 제외
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};

