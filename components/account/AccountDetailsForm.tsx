"use client";

import { createClient } from "@/lib/supabase/browser";
import { cn } from "@/components/ui";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

export type AccountDetailsFormProps = {
  userId: string;
  initialDisplayName: string | null;
  initialPhone: string | null;
  initialAddressLabel: string | null;
  initialAddressLine1: string | null;
  initialAddressLine2: string | null;
  email: string;
};

const inputClass =
  "w-full rounded-md border border-(--commerce-border-default) bg-(--commerce-background-default) px-4 py-2 text-[16px] font-normal leading-[26px] text-(--commerce-text-secondary) outline-none placeholder:text-(--commerce-text-secondary) focus:border-(--commerce-primary-main) focus:ring-1 focus:ring-(--commerce-primary-main)";

const labelClass =
  "text-[12px] font-bold leading-3 text-(--commerce-text-secondary)";

export function AccountDetailsForm({
  userId,
  initialDisplayName,
  initialPhone,
  initialAddressLabel,
  initialAddressLine1,
  initialAddressLine2,
  email,
}: AccountDetailsFormProps) {
  const router = useRouter();
  const sp = useSearchParams();
  const [displayName, setDisplayName] = useState(initialDisplayName ?? "");
  const [phone, setPhone] = useState(initialPhone ?? "");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [reauthNonce, setReauthNonce] = useState("");
  const [needsReauthNonce, setNeedsReauthNonce] = useState(false);
  const [pending, setPending] = useState(false);

  const selectedAddressId = useMemo(() => sp.get("addressId"), [sp]);
  const [addressLabel, setAddressLabel] = useState(initialAddressLabel ?? "");
  const [addressLine1, setAddressLine1] = useState(initialAddressLine1 ?? "");
  const [addressLine2, setAddressLine2] = useState(initialAddressLine2 ?? "");

  useEffect(() => {
    const supabase = createClient();
    const sb = supabase as unknown as { from: (table: string) => any };

    let cancelled = false;
    (async () => {
      const q = sb
        .from("user_addresses")
        .select("label,address_line1,address_line2")
        .eq("user_id", userId);

      const { data, error } = selectedAddressId
        ? await q.eq("id", selectedAddressId).maybeSingle()
        : { data: null, error: null };

      if (cancelled) return;
      if (error) {
        if (selectedAddressId) toast.error("선택한 주소를 불러오지 못했습니다.");
        return;
      }
      if (!selectedAddressId) return;
      if (!data) {
        setAddressLabel("");
        setAddressLine1("");
        setAddressLine2("");
        return;
      }

      setAddressLabel(String(data.label ?? "").trim());
      setAddressLine1(String(data.address_line1 ?? "").trim());
      setAddressLine2(String(data.address_line2 ?? "").trim());
    })();

    return () => {
      cancelled = true;
    };
  }, [selectedAddressId, userId]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const supabase = createClient();
    setPending(true);

    try {
      const trimmedName = displayName.trim();
      const trimmedPhone = phone.trim();
      const { error: profileError } = await supabase
        .from("users")
        .update({
          display_name: trimmedName === "" ? null : trimmedName,
          phone: trimmedPhone === "" ? null : trimmedPhone,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId);

      if (profileError) {
        toast.error(
          profileError.message ||
            "프로필을 저장하지 못했습니다. 잠시 후 다시 시도해 주세요.",
        );
        return;
      }

      const wantsPasswordChange =
        oldPassword.length > 0 ||
        newPassword.length > 0 ||
        repeatPassword.length > 0;

      if (wantsPasswordChange) {
        if (!oldPassword || !newPassword || !repeatPassword) {
          toast.error(
            "비밀번호를 변경하려면 기존·새·확인 필드를 모두 입력하세요.",
          );
          return;
        }
        if (newPassword !== repeatPassword) {
          toast.error("새 비밀번호가 일치하지 않습니다.");
          return;
        }
        if (newPassword.length < 6) {
          toast.error("새 비밀번호는 6자 이상이어야 합니다.");
          return;
        }

        if (needsReauthNonce && !reauthNonce.trim()) {
          toast.error("인증 코드를 입력해 주세요.");
          return;
        }

        const { error: signErr } = await supabase.auth.signInWithPassword({
          email,
          password: oldPassword,
        });
        if (signErr) {
          toast.error("기존 비밀번호가 올바르지 않습니다.");
          return;
        }

        const { error: pwdErr } = await supabase.auth.updateUser(
          needsReauthNonce
            ? { password: newPassword, nonce: reauthNonce.trim() }
            : { password: newPassword },
        );
        if (pwdErr) {
          const raw = pwdErr.message ?? "";
          const needsReauth =
            raw.toLowerCase().includes("reauth") ||
            raw.toLowerCase().includes("nonce") ||
            raw.toLowerCase().includes("otp") ||
            raw.toLowerCase().includes("requires reauthentication");

          if (needsReauth && !needsReauthNonce) {
            const { error: reauthErr } = await supabase.auth.reauthenticate();
            if (reauthErr) {
              toast.error(
                reauthErr.message ||
                  "재인증 코드를 전송하지 못했습니다. 잠시 후 다시 시도해 주세요.",
              );
              return;
            }
            setNeedsReauthNonce(true);
            toast.message("인증 코드가 전송되었습니다. 이메일(또는 휴대폰)을 확인해 주세요.");
            return;
          }

          toast.error(raw || "비밀번호를 변경하지 못했습니다. 잠시 후 다시 시도해 주세요.");
          return;
        }

        setOldPassword("");
        setNewPassword("");
        setRepeatPassword("");
        setReauthNonce("");
        setNeedsReauthNonce(false);
      }

      toast.success("변경 사항이 저장되었습니다.");
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="min-w-0 max-w-[707px]"
      style={{ fontFamily: "var(--commerce-font-body)" }}
    >
      <section>
        <h2 className="text-[20px] font-semibold leading-8 text-black">
          계정 정보
        </h2>

        <div className="mt-6 space-y-1">
          <label htmlFor="display-name" className={cn("block", labelClass)}>
            표시 이름
          </label>
          <input
            id="display-name"
            name="displayName"
            type="text"
            autoComplete="nickname"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="프로필에 표시할 이름"
            className={inputClass}
          />
          <p className="pt-1 text-[12px] italic leading-5 text-(--commerce-text-secondary)">
            마이페이지와 리뷰 등에 이렇게 표시됩니다.
          </p>
        </div>

        <div className="mt-6 space-y-1">
          <label htmlFor="account-email" className={cn("block", labelClass)}>
            이메일 *
          </label>
          <input
            id="account-email"
            name="email"
            type="email"
            readOnly
            disabled
            value={email}
            className={cn(
              inputClass,
              "cursor-not-allowed opacity-75 bg-(--commerce-background-elevated)",
            )}
          />
        </div>

        <div className="mt-6 space-y-1">
          <label htmlFor="account-phone" className={cn("block", labelClass)}>
            연락처
          </label>
          <input
            id="account-phone"
            name="phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="연락처를 입력해 주세요"
            className={inputClass}
          />
        </div>

        <div className="mt-6 space-y-1">
          <label htmlFor="account-address-line1" className={cn("block", labelClass)}>
            주소
          </label>
          <div className="flex items-center gap-3">
            <input
              id="account-address-line1"
              name="addressLine1"
              type="text"
              readOnly
              disabled
              value={
                [
                  addressLabel?.trim() ? `${addressLabel.trim()} ·` : null,
                  addressLine1?.trim() ? addressLine1.trim() : null,
                  addressLine2?.trim() ? addressLine2.trim() : null,
                ]
                  .filter(Boolean)
                  .join(" ")
              }
              placeholder="주소를 선택해 주세요"
              className={cn(
                inputClass,
                "cursor-not-allowed opacity-75 bg-(--commerce-background-elevated)",
              )}
            />
            <button
              type="button"
              disabled={pending}
              className={cn(
                "min-h-10 shrink-0 rounded-lg border px-4 text-[14px] font-semibold leading-[26px]",
                "border-(--commerce-primary-main) bg-white text-(--commerce-primary-main)",
                "hover:bg-(--commerce-background-light) disabled:cursor-not-allowed disabled:opacity-60",
              )}
              onClick={() => router.push("/addresses?next=/account")}
            >
              주소 변경
            </button>
          </div>
          <p className="pt-1 text-[12px] italic leading-5 text-(--commerce-text-secondary)">
            주소 변경을 누르면 주소록에서 선택 후 자동으로 채워집니다.
          </p>
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-[20px] font-semibold leading-8 text-black">
          비밀번호
        </h2>

        <div className="mt-6 space-y-6">
          <div className="space-y-1">
            <label htmlFor="old-password" className={cn("block", labelClass)}>
              현재 비밀번호
            </label>
            <input
              id="old-password"
              name="oldPassword"
              type="password"
              autoComplete="current-password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              placeholder="현재 비밀번호"
              className={inputClass}
            />
          </div>
          <div className="space-y-1">
            <label htmlFor="new-password" className={cn("block", labelClass)}>
              새 비밀번호
            </label>
            <input
              id="new-password"
              name="newPassword"
              type="password"
              autoComplete="new-password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="새 비밀번호"
              className={inputClass}
            />
          </div>
          <div className="space-y-1">
            <label htmlFor="repeat-password" className={cn("block", labelClass)}>
              새 비밀번호 확인
            </label>
            <input
              id="repeat-password"
              name="repeatPassword"
              type="password"
              autoComplete="new-password"
              value={repeatPassword}
              onChange={(e) => setRepeatPassword(e.target.value)}
              placeholder="새 비밀번호 다시 입력"
              className={inputClass}
            />
          </div>

          {needsReauthNonce ? (
            <div className="space-y-1">
              <label htmlFor="reauth-nonce" className={cn("block", labelClass)}>
                인증 코드 *
              </label>
              <input
                id="reauth-nonce"
                name="reauthNonce"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                value={reauthNonce}
                onChange={(e) => setReauthNonce(e.target.value)}
                placeholder="이메일(또는 휴대폰)로 받은 인증 코드를 입력하세요"
                className={inputClass}
              />
              <p className="pt-1 text-[12px] italic leading-5 text-(--commerce-text-secondary)">
                보안 설정에 따라 비밀번호 변경 전에 재인증이 필요할 수 있습니다.
              </p>
            </div>
          ) : null}
        </div>
      </section>

      <div className="mt-10">
        <button
          type="submit"
          disabled={pending}
          className={cn(
            "min-h-[52px] rounded-lg bg-(--commerce-primary-main) px-10 py-3 text-[16px] font-medium leading-7 tracking-[-0.4px] text-(--commerce-text-inverse)",
            "hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60",
          )}
        >
          {pending ? "저장 중…" : "변경 사항 저장"}
        </button>
      </div>
    </form>
  );
}

