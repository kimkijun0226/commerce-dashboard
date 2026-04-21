"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import { FiEye, FiEyeOff } from "react-icons/fi";

import { createClient } from "@/lib/supabase/browser";
import { Button } from "@/components/ui/Button/Button";
import { Checkbox } from "@/components/ui/Checkbox/Checkbox";
import { Input } from "@/components/ui/Input/Input";

type FormState = {
  email: string;
  password: string;
  rememberMe: boolean;
};

type FormErrors = Partial<Record<keyof FormState, string>>;

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const leftImageUrl =
  "https://images.unsplash.com/photo-1713286663271-809d910c0c65?auto=format&fit=crop&w=1600&q=80";

export default function LoginPage() {
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [form, setForm] = useState<FormState>({
    email: "",
    password: "",
    rememberMe: false,
  });
  const [errors, setErrors] = useState<FormErrors>({});

  const canSubmit = useMemo(() => !isLoading, [isLoading]);

  function validate(next: FormState): FormErrors {
    const e: FormErrors = {};

    if (!next.email.trim()) e.email = "이메일은 필수입니다.";
    else if (!emailRegex.test(next.email.trim()))
      e.email = "이메일 형식이 올바르지 않습니다.";

    if (!next.password) e.password = "비밀번호는 필수입니다.";

    return e;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;

    const nextErrors = validate(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      toast.error("입력값을 확인해주세요.");
      return;
    }

    setIsLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({
        email: form.email.trim(),
        password: form.password,
      });

      if (error) {
        toast.error(error.message);
        return;
      }

      toast.success("로그인되었습니다.");
      router.push("/");
      router.refresh();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "로그인 중 오류가 발생했습니다.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <Toaster position="top-center" />

      <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[minmax(0,1fr)_704px]">
        <div className="relative hidden overflow-hidden bg-[#F3F5F7] lg:block">
          <Image
            src={leftImageUrl}
            alt="가구 인테리어 배경 이미지"
            fill
            priority
            sizes="(min-width: 1024px) 60vw, 0px"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-black/10" />
          <div className="absolute left-16 top-8">
            <div
              style={{
                fontFamily: "Poppins",
                fontWeight: 500,
                fontSize: 24,
                lineHeight: "24px",
                color: "#ffffff",
              }}
            >
              Cursor Commerce
            </div>
          </div>
        </div>

        <div className="flex items-start justify-center px-6 py-12 lg:justify-start lg:px-0 lg:py-0">
          <div className="w-full max-w-[456px] pt-6 lg:ml-[88px] lg:pt-[174px]">
            <div className="w-full" style={{ backgroundColor: "#FEFEFE" }}>
              <div className="mb-8">
                <h1
                  style={{
                    fontFamily: "Poppins",
                    fontWeight: 500,
                    fontSize: 40,
                    lineHeight: "44px",
                    letterSpacing: "-0.4px",
                    color: "#141718",
                  }}
                >
                  Sign In
                </h1>
                <button
                  type="button"
                  className="mt-3 text-left"
                  onClick={() => router.push("/signup")}
                  disabled={isLoading}
                  style={{
                    fontFamily: "Inter",
                    fontWeight: 400,
                    fontSize: 16,
                    lineHeight: "26px",
                    color: "#141718",
                  }}
                >
                  아직 계정이 없나요?{" "}
                  <span className="font-semibold">회원가입</span>
                </button>
              </div>

              <form onSubmit={onSubmit} noValidate>
                <div className="flex flex-col gap-8">
                  <Input
                    variant="underline"
                    required
                    type="email"
                    inputMode="email"
                    placeholder="이메일"
                    value={form.email}
                    onChange={(ev) =>
                      setForm((p) => ({ ...p, email: ev.target.value }))
                    }
                    disabled={isLoading}
                    autoComplete="email"
                    error={errors.email}
                    className="placeholder:text-[#6C7275]"
                  />

                  <div className="relative">
                    <Input
                      variant="underline"
                      required
                      type={showPassword ? "text" : "password"}
                      placeholder="비밀번호"
                      value={form.password}
                      onChange={(ev) =>
                        setForm((p) => ({ ...p, password: ev.target.value }))
                      }
                      disabled={isLoading}
                      autoComplete="current-password"
                      error={errors.password}
                      className="pr-9 placeholder:text-[#6C7275]"
                    />
                    <button
                      type="button"
                      className="absolute right-0 top-0 inline-flex h-10 w-10 items-center justify-end"
                      onClick={() => setShowPassword((v) => !v)}
                      disabled={isLoading}
                      aria-label={
                        showPassword ? "비밀번호 숨기기" : "비밀번호 보기"
                      }
                      style={{ color: "#141718" }}
                    >
                      {showPassword ? <FiEyeOff size={24} /> : <FiEye size={24} />}
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <Checkbox
                      checked={form.rememberMe}
                      onChange={(ev) =>
                        setForm((p) => ({
                          ...p,
                          rememberMe: ev.target.checked,
                        }))
                      }
                      disabled={isLoading}
                      label={
                        <span
                          style={{
                            fontFamily: "Inter",
                            fontWeight: 400,
                            fontSize: 16,
                            lineHeight: "26px",
                            color: "#6C7275",
                          }}
                        >
                          로그인 상태 유지
                        </span>
                      }
                    />
                    <button
                      type="button"
                      disabled={isLoading}
                      onClick={() => toast("비밀번호 찾기는 아직 구현되지 않았습니다.")}
                      style={{
                        fontFamily: "Inter",
                        fontWeight: 600,
                        fontSize: 16,
                        lineHeight: "26px",
                        color: "#141718",
                      }}
                    >
                      비밀번호를 잊으셨나요?
                    </button>
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    loading={isLoading}
                    style={{
                      backgroundColor: "#141718",
                      color: "#FFFFFF",
                      borderRadius: 8,
                      minHeight: 48,
                      fontFamily: "Inter",
                      fontWeight: 500,
                      fontSize: 16,
                      lineHeight: "28px",
                      letterSpacing: "-0.4px",
                    }}
                  >
                    Sign In
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
