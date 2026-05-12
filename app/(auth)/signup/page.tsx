"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { useForm } from "react-hook-form";

import { createClient } from "@/lib/supabase/browser";
import { Button } from "@/components/ui/Button/Button";
import { Checkbox } from "@/components/ui/Checkbox/Checkbox";
import { Input } from "@/components/ui/Input/Input";

type SignupFormValues = {
  name: string;
  username: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  agreeToTerms: boolean;
};

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const leftImageUrl =
  "https://images.unsplash.com/photo-1713286663271-809d910c0c65?auto=format&fit=crop&w=1600&q=80";

export default function SignupPage() {
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const canSubmit = useMemo(() => !isLoading, [isLoading]);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SignupFormValues>({
    defaultValues: {
      name: "",
      username: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
      agreeToTerms: false,
    },
    mode: "onSubmit",
  });

  const passwordValue = watch("password");

  const onSubmit = handleSubmit(async (values) => {
    if (!canSubmit) return;
    setIsLoading(true);
    try {
      const supabase = createClient();
      const name = values.name.trim();
      const username = values.username.trim();
      const phone = values.phone.trim();

      const data: Record<string, string> = {};
      if (name) data.name = name;
      if (username) data.username = username;
      if (phone) data.phone = phone;

      const { error } = await supabase.auth.signUp({
        email: values.email.trim(),
        password: values.password,
        options: {
          data,
        },
      });

      if (error) {
        toast.error(error.message);
        return;
      }

      toast.success("회원가입이 완료되었습니다. 로그인해주세요.");
      router.push("/login");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "회원가입 중 오류가 발생했습니다.",
      );
    } finally {
      setIsLoading(false);
    }
  });

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
                <div className="flex items-start justify-between">
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
                    Sign up
                  </h1>
                </div>
                <button
                  type="button"
                  className="mt-3 text-left"
                  onClick={() => router.push("/login")}
                  disabled={isLoading}
                  style={{
                    fontFamily: "Inter",
                    fontWeight: 400,
                    fontSize: 16,
                    lineHeight: "26px",
                    color: "#141718",
                  }}
                >
                  이미 계정이 있나요? <span className="font-semibold">로그인</span>
                </button>
              </div>

              <form onSubmit={onSubmit} noValidate>
                <div className="flex flex-col gap-8">
                  <Input
                    variant="underline"
                    placeholder="이름 (선택)"
                    {...register("name")}
                    disabled={isLoading}
                    autoComplete="name"
                    className="placeholder:text-[#6C7275]"
                  />

                  <Input
                    variant="underline"
                    placeholder="사용자명 (선택)"
                    {...register("username")}
                    disabled={isLoading}
                    autoComplete="username"
                    className="placeholder:text-[#6C7275]"
                  />

                  <Input
                    variant="underline"
                    required
                    type="email"
                    inputMode="email"
                    placeholder="이메일"
                    {...register("email", {
                      required: "이메일은 필수입니다.",
                      validate: (v) =>
                        emailRegex.test(v.trim()) ||
                        "이메일 형식이 올바르지 않습니다.",
                    })}
                    disabled={isLoading}
                    autoComplete="email"
                    error={errors.email?.message}
                    className="placeholder:text-[#6C7275]"
                  />

                  <Input
                    variant="underline"
                    required
                    inputMode="tel"
                    placeholder="연락처"
                    {...register("phone", {
                      required: "연락처는 필수입니다.",
                    })}
                    disabled={isLoading}
                    autoComplete="tel"
                    error={errors.phone?.message}
                    className="placeholder:text-[#6C7275]"
                  />

                  <div className="relative">
                    <Input
                      variant="underline"
                      required
                      type={showPassword ? "text" : "password"}
                      placeholder="비밀번호 (최소 6자)"
                      {...register("password", {
                        required: "비밀번호는 필수입니다.",
                        minLength: {
                          value: 6,
                          message: "비밀번호는 최소 6자 이상이어야 합니다.",
                        },
                      })}
                      disabled={isLoading}
                      autoComplete="new-password"
                      error={errors.password?.message}
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

                  <div className="relative">
                    <Input
                      variant="underline"
                      required
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="비밀번호 확인"
                      {...register("confirmPassword", {
                        required: "비밀번호 확인은 필수입니다.",
                        validate: (v) =>
                          v === passwordValue || "비밀번호가 일치하지 않습니다.",
                      })}
                      disabled={isLoading}
                      autoComplete="new-password"
                      error={errors.confirmPassword?.message}
                      className="pr-9 placeholder:text-[#6C7275]"
                    />
                    <button
                      type="button"
                      className="absolute right-0 top-0 inline-flex h-10 w-10 items-center justify-end"
                      onClick={() => setShowConfirmPassword((v) => !v)}
                      disabled={isLoading}
                      aria-label={
                        showConfirmPassword ? "비밀번호 숨기기" : "비밀번호 보기"
                      }
                      style={{ color: "#141718" }}
                    >
                      {showConfirmPassword ? (
                        <FiEyeOff size={24} />
                      ) : (
                        <FiEye size={24} />
                      )}
                    </button>
                  </div>

                  <Checkbox
                    {...register("agreeToTerms", {
                      required: "약관에 동의해주세요.",
                    })}
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
                        개인정보 처리방침 및 이용약관에 동의합니다.
                      </span>
                    }
                    error={errors.agreeToTerms?.message}
                  />

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
                    회원가입
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
