"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSessionStore } from "@/commons/store/session-store";
import { createClient } from "@/lib/supabase/browser";
import toast, { Toaster } from "react-hot-toast";

export default function AccountPage() {
  const user = useSessionStore((s) => s.user);
  const isAuthenticated = useSessionStore((s) => s.isAuthenticated);
  const router = useRouter();

  return (
    <div className="mx-auto w-full max-w-[960px] px-4 py-10">
      <Toaster position="top-center" />
      <h1 className="text-2xl font-semibold">마이페이지</h1>

      {!isAuthenticated ? (
        <div className="mt-6 rounded-xl border border-(--commerce-border-subtle) bg-white p-6">
          <p className="text-(--commerce-text-primary)">
            현재 로그인되어 있지 않습니다.
          </p>
          <Link
            href="/login"
            className="mt-4 inline-flex rounded-md px-3 py-2 font-semibold text-(--commerce-text-primary) hover:bg-(--commerce-background-light)"
          >
            로그인하러 가기
          </Link>
        </div>
      ) : (
        <div className="mt-6 rounded-xl border border-(--commerce-border-subtle) bg-white p-6">
          <div className="text-(--commerce-text-primary)">
            <div className="text-sm text-(--commerce-text-muted)">로그인 상태</div>
            <div className="mt-2 grid gap-1">
              <div>
                <span className="font-semibold">이메일</span>: {user?.email}
              </div>
              <div>
                <span className="font-semibold">표시 이름</span>:{" "}
                {user?.displayName ?? "—"}
              </div>
              <div>
                <span className="font-semibold">권한</span>: {user?.role}
              </div>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-end">
            <button
              type="button"
              className="rounded-md px-3 py-2 text-[14px] font-semibold leading-6 text-(--commerce-text-primary) hover:bg-(--commerce-background-light)"
              onClick={async () => {
                const supabase = createClient();
                const { error } = await supabase.auth.signOut();
                if (error) {
                  toast.error(error.message);
                  return;
                }
                toast.success("로그아웃되었습니다.");
                router.push("/");
                router.refresh();
              }}
            >
              로그아웃
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
