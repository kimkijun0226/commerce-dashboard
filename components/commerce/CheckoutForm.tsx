"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { toast } from "sonner";
import { clearSessionPendingOrderId, setSessionPendingOrderId } from "@/commons/utils/order";
import { commerceColors } from "@/commons/constants/color";
import { commerceTypography } from "@/commons/constants/typography";
import { Button, Checkbox, Input, PostcodeSearchDialog, cn, typographyToStyle } from "@/components/ui";
import { OrderSummary, type OrderSummaryItem } from "@/components/commerce/OrderSummary";
import type { PricingTotals } from "@/lib/commerce/pricing";
import { findOrCreateOrder } from "@/app/(commerce)/checkout/actions";
import { PaymentMethodDropdown } from "@/components/commerce/PaymentMethodDropdown";
import { TossPayment, type TossPaymentHandle } from "@/components/commerce/TossPayment";
import type { AddressDropdownValue, UserAddress } from "@/components/commerce/AddressDropdown";
import { useRouter } from "next/navigation";
import { markTossPaymentFailed } from "@/app/(commerce)/checkout/toss-payment-actions";

export type CheckoutFormValues = {
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  shippingName: string;
  shippingPhone: string;
  addressLine1: string;
  addressLine2?: string;
  memo?: string;
  paymentMethod: "toss";
  agreeToTerms: boolean;
};

export type CheckoutFormProps = {
  initialValues?: Partial<CheckoutFormValues>;
  items: readonly OrderSummaryItem[];
  totals: PricingTotals;
  addresses: readonly UserAddress[];
  defaultAddressId: string | null;
  /** TossPayments 회원 결제용 customerKey (예: `tossCustomerKeyForUser(user.id)`) */
  tossCustomerKey: string;
  className?: string;
};

function readString(fd: FormData, key: string): string {
  return String(fd.get(key) ?? "").trim();
}

const TOSS_CLIENT_KEY = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY ?? "";

export function CheckoutForm({
  initialValues,
  items,
  totals,
  addresses,
  defaultAddressId,
  tossCustomerKey,
  className,
}: CheckoutFormProps) {
  const router = useRouter();
  const tossRef = useRef<TossPaymentHandle>(null);
  const [tossReady, setTossReady] = useState(false);
  const [pending, start] = useTransition();
  const [cartUpdating, setCartUpdating] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"toss">("toss");
  const [sameAsContact, setSameAsContact] = useState(false);
  const [saveAddress, setSaveAddress] = useState(false);
  const [saveAsDefault, setSaveAsDefault] = useState(false);

  const initialAddressValue: AddressDropdownValue = useMemo(() => {
    return defaultAddressId ? { mode: "saved", addressId: defaultAddressId } : { mode: "new" };
  }, [defaultAddressId]);
  const [addressValue, setAddressValue] = useState<AddressDropdownValue>(initialAddressValue);

  const defaults = useMemo(
    () => ({
      contactName: initialValues?.contactName ?? initialValues?.shippingName ?? "",
      contactPhone: initialValues?.contactPhone ?? initialValues?.shippingPhone ?? "",
      contactEmail: initialValues?.contactEmail ?? "",
      // 배송지 받는 분/연락처는 기본적으로 비워두고,
      // "주문자 정보와 동일" 체크 시에만 contact 값을 복사한다.
      // (저장된 배송지를 선택했다면 별도 effect에서 주입됨)
      shippingName: initialValues?.shippingName ?? "",
      shippingPhone: initialValues?.shippingPhone ?? "",
      addressLine1: initialValues?.addressLine1 ?? "",
      addressLine2: initialValues?.addressLine2 ?? "",
      memo: initialValues?.memo ?? "",
      paymentMethod: "toss" as const,
      agreeToTerms: Boolean(initialValues?.agreeToTerms),
    }),
    [initialValues],
  );

  const [contactName, setContactName] = useState(defaults.contactName);
  const [contactPhone, setContactPhone] = useState(defaults.contactPhone);
  const [contactEmail, setContactEmail] = useState(defaults.contactEmail);
  const [contactAddressLine1, setContactAddressLine1] = useState("");
  const [contactAddressLine2, setContactAddressLine2] = useState("");

  const [shippingName, setShippingName] = useState(defaults.shippingName);
  const [shippingPhone, setShippingPhone] = useState(defaults.shippingPhone);
  const [addressLine1, setAddressLine1] = useState(defaults.addressLine1);
  const [addressLine2, setAddressLine2] = useState(defaults.addressLine2);
  const [memo, setMemo] = useState(defaults.memo);
  const [addressLabel, setAddressLabel] = useState("");
  const [postcodeOpen, setPostcodeOpen] = useState(false);

  const selectedSavedAddress = useMemo(() => {
    if (addressValue.mode !== "saved") return null;
    return addresses.find((a) => a.id === addressValue.addressId) ?? null;
  }, [addressValue, addresses]);

  // URL param 등으로 defaultAddressId가 바뀌었을 때 선택 state를 동기화
  useEffect(() => {
    setAddressValue(defaultAddressId ? { mode: "saved", addressId: defaultAddressId } : { mode: "new" });
  }, [defaultAddressId]);

  // NOTE:
  // Shipping Address는 기본적으로 "비어있는 상태"에서 시작한다.
  // 주소록(저장된 배송지)을 선택하더라도 Shipping 입력값을 자동 주입하지 않는다.
  // - 받는 분/연락처: "주문자 정보와 동일" 체크 ON일 때만 복사
  // - 주소: Shipping 섹션에서 직접 검색/입력한다.

  // Checkout에서 주소는 "저장된 주소 행 클릭"으로 선택된다.
  // 선택된 주소는 contact/shipping 공통으로 참조(주소만), 받는 분/연락처는 Shipping에서 관리.
  useEffect(() => {
    if (!selectedSavedAddress) {
      setContactAddressLine1("");
      setContactAddressLine2("");
      return;
    }
    setContactAddressLine1(selectedSavedAddress.addressLine1);
    setContactAddressLine2(selectedSavedAddress.addressLine2 ?? "");
  }, [selectedSavedAddress]);

  useEffect(() => {
    if (!sameAsContact) return;
    setShippingName(contactName);
    setShippingPhone(contactPhone);
    setAddressLine1(contactAddressLine1);
    setAddressLine2(contactAddressLine2);
  }, [sameAsContact, contactName, contactPhone, contactAddressLine1, contactAddressLine2]);

  return (
    <>
      <TossPayment
        ref={tossRef}
        clientKey={TOSS_CLIENT_KEY}
        customerKey={tossCustomerKey}
        successPath="/checkout/success"
        failPath="/checkout/fail"
        onReadyChange={setTossReady}
      />
      <div
        className={cn(
          "mt-12 grid gap-12 lg:grid-cols-[minmax(0,643px)_413px] lg:items-start lg:gap-24",
          className,
        )}
      >
        <form
          className="order-2 flex flex-col gap-10 lg:order-1"
          aria-label="결제 정보 입력"
          onSubmit={(e) => {
          e.preventDefault();
          if (pending) return;
          setSubmitted(true);

          const fd = new FormData(e.currentTarget);
          const values: CheckoutFormValues = {
            contactName: contactName.trim(),
            contactPhone: contactPhone.trim(),
            contactEmail: contactEmail.trim(),
            shippingName: shippingName.trim(),
            shippingPhone: shippingPhone.trim(),
            addressLine1: addressLine1.trim(),
            addressLine2: addressLine2.trim() || undefined,
            memo: memo.trim() || undefined,
            paymentMethod: (readString(fd, "paymentMethod") as "toss") || "toss",
            agreeToTerms: fd.get("agreeToTerms") === "on",
          };

          start(async () => {
            let storedPendingOrderId: string | null = null;
            try {
              if (!TOSS_CLIENT_KEY.trim()) {
                toast.error("Toss 클라이언트 키가 설정되지 않았습니다.");
                return;
              }
              if (!tossRef.current?.ready) {
                toast.error("결제 모듈을 불러오는 중입니다. 잠시 후 다시 시도해 주세요.");
                return;
              }

              const created = await findOrCreateOrder({
                form: values,
                clientTotals: totals,
                address:
                  sameAsContact && addressValue.mode === "saved"
                    ? { mode: "saved", addressId: addressValue.addressId }
                    : {
                        mode: "new",
                        save: saveAddress,
                        setDefault: saveAsDefault,
                        label: addressLabel.trim() || undefined,
                      },
              });

              storedPendingOrderId = created.orderId;
              setSessionPendingOrderId(created.orderId);

              await tossRef.current.requestPayment({
                orderId: created.tossOrderId,
                orderName: created.orderName,
                amount: created.amount,
                customerName: values.contactName,
                customerEmail: values.contactEmail,
                customerMobilePhone: values.contactPhone,
              });
            } catch (err) {
              // 결제창에서 사용자가 취소하면 리다이렉트(orderId 포함)가 안 오는 케이스가 있어
              // 여기서도 pending 결제 레코드를 cancelled로 정리한다.
              const raw = err instanceof Error ? err.message : String(err ?? "");
              if (storedPendingOrderId) {
                const isCanceled =
                  raw.includes("PAY_PROCESS_CANCELED") ||
                  raw.includes("canceled") ||
                  raw.includes("cancelled") ||
                  raw.includes("취소");
                if (isCanceled) {
                  await markTossPaymentFailed({
                    tossOrderId: storedPendingOrderId,
                    code: "PAY_PROCESS_CANCELED",
                    message: raw,
                  });
                  clearSessionPendingOrderId();

                  // SDK가 리다이렉트를 수행하지 않은 취소 케이스는 직접 실패 페이지로 이동
                  const qp = new URLSearchParams({
                    code: "PAY_PROCESS_CANCELED",
                    message: raw.slice(0, 300),
                    orderId: storedPendingOrderId,
                  });
                  router.push(`/checkout/fail?${qp.toString()}`);
                  return;
                }
              }
              // 취소가 아닌 오류도 SDK가 리다이렉트하지 않는 경우가 있어 실패 페이지로 이동시킴
              if (storedPendingOrderId) {
                const qp = new URLSearchParams({
                  code: "PAY_PROCESS_ABORTED",
                  message: raw.slice(0, 300),
                  orderId: storedPendingOrderId,
                });
                router.push(`/checkout/fail?${qp.toString()}`);
              }

              const msg = err instanceof Error ? err.message : "주문 처리에 실패했습니다.";
              const [, readable] = msg.includes(":") ? msg.split(/:(.+)/) : ["", msg];
              toast.error(readable || msg);
            }
          });
          }}
        >
        <Section title="Contact Information">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Input
              name="contactName"
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              required
              disabled={pending}
              label="이름"
              autoComplete="name"
            />
            <Input
              name="contactPhone"
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
              required
              disabled={pending}
              label="연락처"
              inputMode="tel"
              autoComplete="tel"
            />
            <Input
              name="contactEmail"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              required
              disabled={pending}
              label="이메일"
              inputMode="email"
              autoComplete="email"
              className="sm:col-span-2"
            />
          </div>

          <div className="mt-3">
            <div className="flex items-end gap-2">
              <Input
                name="selectedAddress"
                value={contactAddressLine1}
                readOnly
                disabled={pending}
                label="주소"
                placeholder="저장된 배송지를 선택하세요."
                className="flex-1"
              />
              <Button
                type="button"
                variant="secondary"
                size="md"
                disabled={pending}
                className="shrink-0"
                onClick={() => router.push("/addresses?next=/checkout")}
              >
                주소 검색
              </Button>
            </div>
          </div>

          <div className="mt-3">
            <Input
              name="contactAddressLine2"
              value={contactAddressLine2}
              onChange={(e) => setContactAddressLine2(e.target.value)}
              readOnly
              disabled={pending}
              label="상세주소 (선택)"
              className="sm:col-span-2"
            />
          </div>
        </Section>

        <div className="pt-10">
        <Section
          title="Shipping Address"
          right={
            <Checkbox
              name="sameAsContact"
              checked={sameAsContact}
              onChange={(e) => {
                const next = e.currentTarget.checked;
                setSameAsContact(next);
                if (next) {
                  setShippingName(contactName.trim());
                  setShippingPhone(contactPhone.trim());
                  setAddressLine1(contactAddressLine1.trim());
                  setAddressLine2(contactAddressLine2.trim());
                  return;
                }
                // 체크 해제 시: 동기화 중단 + 받는 분/연락처는 직접 입력하도록 비움
                setShippingName("");
                setShippingPhone("");
                setAddressLine1("");
                setAddressLine2("");
                setMemo("");
              }}
              disabled={pending}
              label={
                <span
                  style={{
                    ...typographyToStyle(commerceTypography.caption2),
                    color: commerceColors.text.secondary,
                  }}
                >
                  주문자 정보와 동일
                </span>
              }
              id="checkout-same-as-contact"
              className="translate-y-[2px]"
            />
          }
        >
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Input
              name="shippingName"
              value={shippingName}
              onChange={(e) => setShippingName(e.target.value)}
              required
              disabled={pending || sameAsContact}
              label="받는 분"
              autoComplete="shipping name"
            />
            <Input
              name="shippingPhone"
              value={shippingPhone}
              onChange={(e) => setShippingPhone(e.target.value)}
              required
              disabled={pending || sameAsContact}
              label="배송 연락처"
              inputMode="tel"
              autoComplete="shipping tel"
            />
            <div className="sm:col-span-2">
              <div className="flex items-end gap-2">
                <Input
                  name="addressLine1"
                  value={addressLine1}
                  onChange={(e) => setAddressLine1(e.target.value)}
                  required
                  disabled={pending}
                  label="주소"
                  autoComplete="shipping street-address"
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="secondary"
                  size="md"
                  disabled={pending}
              onClick={() => setPostcodeOpen(true)}
                  className="shrink-0"
                >
                  주소 검색
                </Button>
              </div>
            </div>
            <Input
              name="addressLine2"
              value={addressLine2}
              onChange={(e) => setAddressLine2(e.target.value)}
              disabled={pending}
              label="상세주소 (선택)"
              autoComplete="shipping address-line2"
              className="sm:col-span-2"
            />
            <div className="sm:col-span-2">
              <ShippingMemoDropdown value={memo} onChange={setMemo} disabled={pending} />
            </div>
          </div>

          {addressValue.mode === "new" ? (
            <div className="mt-2 flex flex-col gap-3">
              <Checkbox
                name="saveAddress"
                checked={saveAddress}
                onChange={(e) => setSaveAddress(e.currentTarget.checked)}
                disabled={pending}
                label={
                  <span
                    style={{
                      ...typographyToStyle(commerceTypography.body2),
                      color: commerceColors.text.primary,
                    }}
                  >
                    이 배송지를 내 주소록에 저장
                  </span>
                }
                id="checkout-save-address"
              />

              {saveAddress ? (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <Input
                    name="addressLabel"
                    value={addressLabel}
                    onChange={(e) => setAddressLabel(e.target.value)}
                    disabled={pending}
                    label="라벨 (선택)"
                    description="예: 집, 회사, 부모님 댁"
                    className="sm:col-span-2"
                  />
                  <Checkbox
                    name="saveAsDefault"
                    checked={saveAsDefault}
                    onChange={(e) => setSaveAsDefault(e.currentTarget.checked)}
                    disabled={pending}
                    label={
                      <span
                        style={{
                          ...typographyToStyle(commerceTypography.body2),
                          color: commerceColors.text.primary,
                        }}
                      >
                        기본 배송지로 설정
                      </span>
                    }
                    id="checkout-save-default"
                    className="sm:col-span-2"
                  />
                </div>
              ) : null}
            </div>
          ) : null}
        </Section>
        </div>

        <Section title="Payment method">
          <PaymentMethodDropdown
            name="paymentMethod"
            value={paymentMethod}
            onChange={setPaymentMethod}
            disabled={pending}
          />
        </Section>

        <div className="flex flex-col gap-3">
          <Checkbox
            name="agreeToTerms"
            defaultChecked={defaults.agreeToTerms}
            disabled={pending}
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
            id="checkout-agree"
          />

          {submitted && !defaults.agreeToTerms ? null : null}
        </div>

        <div className="flex items-center justify-end gap-2 pt-2">
          <Button
            type="submit"
            size="lg"
            disabled={
              pending ||
              cartUpdating ||
              items.length === 0 ||
              !tossReady ||
              !TOSS_CLIENT_KEY.trim()
            }
          >
            {pending ? "처리 중..." : "Place Order"}
          </Button>
        </div>
        </form>

        <OrderSummary
          className="order-1 lg:order-2"
          items={items}
          totals={totals}
          editable
          quantityUpdating={cartUpdating}
          onQuantityChange={async (productId, nextQty) => {
            if (cartUpdating || pending) return;
            setCartUpdating(true);
            try {
              const res = await fetch("/api/cart", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ productId, quantity: nextQty }),
              });
              if (!res.ok) {
                const data = (await res.json().catch(() => null)) as { error?: string } | null;
                throw new Error(data?.error || "수량을 변경하지 못했습니다.");
              }
              router.refresh();
            } catch (e) {
              const msg = e instanceof Error ? e.message : "수량을 변경하지 못했습니다.";
              toast.error(msg);
            } finally {
              setCartUpdating(false);
            }
          }}
        />
      </div>

      <PostcodeSearchDialog
        open={postcodeOpen}
        onClose={() => setPostcodeOpen(false)}
        onSelect={({ address }) => {
          setAddressLine1(address);
        }}
      />
    </>
  );
}

const MEMO_PRESETS = [
  "문 앞에 놓아주세요.",
  "경비실에 맡겨주세요.",
  "부재 시 연락 부탁드려요.",
  "배송 전 연락 주세요.",
  "직접 입력",
] as const;

function ShippingMemoDropdown({
  value,
  onChange,
  disabled,
}: {
  value: string;
  onChange: (next: string) => void;
  disabled?: boolean;
}) {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const [open, setOpen] = useState(false);
  const [custom, setCustom] = useState("");

  const isCustom = value.trim().length > 0 && !MEMO_PRESETS.slice(0, -1).includes(value as any);
  const displayValue = value.trim() ? value.trim() : "";

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      const el = wrapRef.current;
      if (!el) return;
      if (el.contains(e.target as Node)) return;
      setOpen(false);
    };
    window.addEventListener("mousedown", onDown);
    return () => window.removeEventListener("mousedown", onDown);
  }, [open]);

  useEffect(() => {
    if (isCustom) setCustom(value);
    // preset 선택이면 custom은 유지(원하면 다시 돌아올 수 있게)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCustom]);

  return (
    <div ref={wrapRef} className="relative">
      <label
        className="flex items-center gap-1"
        style={{
          ...typographyToStyle(commerceTypography.caption2Semi),
          color: commerceColors.text.secondary,
        }}
      >
        배송 메모 (선택)
      </label>

      <button
        type="button"
        disabled={disabled}
        className={cn(
          "mt-1 flex w-full items-center justify-between gap-3 rounded-md border px-3 py-2 text-left",
          "min-h-10",
          "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-(--commerce-semantic-info)",
          "disabled:cursor-not-allowed disabled:opacity-60",
        )}
        style={{
          ...typographyToStyle(commerceTypography.body2),
          color: displayValue ? commerceColors.text.primary : commerceColors.text.muted,
          backgroundColor: commerceColors.background.default,
          borderColor: commerceColors.border.default,
        }}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <span className="min-w-0 flex-1 truncate">
          {displayValue || "배송 메모를 선택하거나 직접 입력하세요."}
        </span>
        <span
          className="shrink-0"
          style={{ color: commerceColors.text.secondary }}
          aria-hidden
        >
          ▾
        </span>
      </button>

      {open ? (
        <div
          className="absolute z-20 mt-2 w-full overflow-hidden rounded-xl border bg-white shadow-sm"
          style={{ borderColor: commerceColors.border.subtle }}
          role="listbox"
          aria-label="배송 메모 선택"
        >
          <div className="flex flex-col">
            {MEMO_PRESETS.map((opt) => {
              const isDirect = opt === "직접 입력";
              const checked = isDirect ? isCustom : value.trim() === opt;
              return (
                <button
                  key={opt}
                  type="button"
                  className={cn(
                    "flex w-full items-center justify-between gap-3 px-4 py-3 text-left",
                    "hover:bg-(--commerce-background-light)",
                  )}
                  onClick={() => {
                    if (isDirect) {
                      onChange(custom);
                      return;
                    }
                    onChange(opt);
                    setOpen(false);
                  }}
                >
                  <span
                    style={{
                      ...typographyToStyle(commerceTypography.body2),
                      color: commerceColors.text.primary,
                    }}
                  >
                    {opt}
                  </span>
                  <span
                    className="shrink-0 text-[14px] font-semibold"
                    style={{
                      color: checked ? commerceColors.primary.main : "transparent",
                    }}
                    aria-hidden
                  >
                    ✓
                  </span>
                </button>
              );
            })}
          </div>

          <div className="border-t px-4 py-3" style={{ borderColor: commerceColors.border.subtle }}>
            <Input
              name="memo"
              value={custom}
              onChange={(e) => {
                const next = e.target.value;
                setCustom(next);
                onChange(next);
              }}
              disabled={disabled}
              label="직접 입력"
              placeholder="예: 문 앞에 두고 문자 주세요"
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}

function Section({
  title,
  right,
  children,
}: {
  title: string;
  right?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-end justify-between gap-4">
        <h2
          style={{
            ...typographyToStyle(commerceTypography.headline7),
            color: commerceColors.text.primary,
          }}
        >
          {title}
        </h2>
        {right ? <div className="shrink-0">{right}</div> : null}
      </div>
      {children}
    </section>
  );
}

