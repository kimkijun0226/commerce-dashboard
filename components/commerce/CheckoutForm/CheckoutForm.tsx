"use client";

import { commerceColors } from "@/commons/constants/color";
import { commerceTypography } from "@/commons/constants/typography";
import { Button, Checkbox, Input, Select, cn, typographyToStyle } from "@/components/ui";
import type { FormEventHandler } from "react";
import { useId, useMemo } from "react";

export type CheckoutFormValues = {
  name: string;
  phone: string;
  email?: string;
  address1: string;
  address2?: string;
  memo?: string;
  paymentMethod: "toss";
  agreeToTerms: boolean;
};

export type CheckoutFormProps = {
  initialValues?: Partial<CheckoutFormValues>;
  onSubmit?: (values: CheckoutFormValues) => void;
  disabled?: boolean;
  className?: string;
};

function readString(fd: FormData, key: string): string {
  return String(fd.get(key) ?? "").trim();
}

export function CheckoutForm({
  initialValues,
  onSubmit,
  disabled,
  className,
}: CheckoutFormProps) {
  const id = useId();
  const defaults = useMemo(
    () => ({
      name: initialValues?.name ?? "",
      phone: initialValues?.phone ?? "",
      email: initialValues?.email ?? "",
      address1: initialValues?.address1 ?? "",
      address2: initialValues?.address2 ?? "",
      memo: initialValues?.memo ?? "",
      paymentMethod: "toss" as const,
      agreeToTerms: Boolean(initialValues?.agreeToTerms),
    }),
    [initialValues],
  );

  const handleSubmit: FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const values: CheckoutFormValues = {
      name: readString(fd, "name"),
      phone: readString(fd, "phone"),
      email: readString(fd, "email") || undefined,
      address1: readString(fd, "address1"),
      address2: readString(fd, "address2") || undefined,
      memo: readString(fd, "memo") || undefined,
      paymentMethod: (readString(fd, "paymentMethod") as "toss") || "toss",
      agreeToTerms: fd.get("agreeToTerms") === "on",
    };
    onSubmit?.(values);
  };

  return (
    <form
      className={cn("flex flex-col gap-4", className)}
      onSubmit={handleSubmit}
      aria-label="결제 정보 입력"
    >
      <section className="flex flex-col gap-3">
        <h2
          style={{
            ...typographyToStyle(commerceTypography.headline7),
            color: commerceColors.text.primary,
          }}
        >
          배송 정보
        </h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Input
            name="name"
            defaultValue={defaults.name}
            required
            disabled={disabled}
            label="받는 분"
            autoComplete="name"
          />
          <Input
            name="phone"
            defaultValue={defaults.phone}
            required
            disabled={disabled}
            label="연락처"
            inputMode="tel"
            autoComplete="tel"
          />
          <Input
            name="email"
            defaultValue={defaults.email}
            disabled={disabled}
            label="이메일 (선택)"
            inputMode="email"
            autoComplete="email"
            className="sm:col-span-2"
          />
          <Input
            name="address1"
            defaultValue={defaults.address1}
            required
            disabled={disabled}
            label="주소"
            autoComplete="shipping street-address"
            className="sm:col-span-2"
          />
          <Input
            name="address2"
            defaultValue={defaults.address2}
            disabled={disabled}
            label="상세주소 (선택)"
            autoComplete="shipping address-line2"
            className="sm:col-span-2"
          />
          <Input
            name="memo"
            defaultValue={defaults.memo}
            disabled={disabled}
            label="배송 메모 (선택)"
            className="sm:col-span-2"
          />
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2
          style={{
            ...typographyToStyle(commerceTypography.headline7),
            color: commerceColors.text.primary,
          }}
        >
          결제 수단
        </h2>
        <Select
          name="paymentMethod"
          defaultValue={defaults.paymentMethod}
          disabled={disabled}
          options={[{ value: "toss", label: "토스페이먼츠" }]}
          aria-label="결제 수단"
        />
      </section>

      <section className="flex flex-col gap-3">
        <Checkbox
          name="agreeToTerms"
          defaultChecked={defaults.agreeToTerms}
          disabled={disabled}
          label={
            <span
              style={{
                ...typographyToStyle(commerceTypography.body2),
                color: commerceColors.text.primary,
              }}
            >
              주문 진행에 필요한 약관에 동의합니다
            </span>
          }
          id={`${id}-agree`}
        />
      </section>

      <div className="flex items-center justify-end gap-2">
        <Button type="submit" size="lg" disabled={disabled}>
          결제 요청
        </Button>
      </div>
    </form>
  );
}

