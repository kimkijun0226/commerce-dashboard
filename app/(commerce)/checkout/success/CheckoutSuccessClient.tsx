"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { FiCheckCircle } from "react-icons/fi";
import { checkoutMessages } from "@/commons/constants/checkoutMessages";
import { commerceColors } from "@/commons/constants/color";
import { commerceTypography } from "@/commons/constants/typography";
import { ACCOUNT_URLS } from "@/commons/constants/url";
import { Button, cn, typographyToStyle } from "@/components/ui";
import { CheckoutProgress } from "@/components/commerce/CheckoutProgress";
import { confirmTossPayment, type TossConfirmResult } from "../toss-payment-actions";
import { useCartStore } from "@/commons/store/cart-store";

type LocalError = { ok: false; message: string; params: Record<string, string> };

function isConfirmOk(r: TossConfirmResult | LocalError | null): r is TossConfirmResult {
  return Boolean(r && "ok" in r);
}

export function CheckoutSuccessClient() {
  const sp = useSearchParams();
  const [result, setResult] = useState<TossConfirmResult | LocalError | null>(null);
  const clearCart = useCartStore((s) => s.clear);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const paymentKey = sp.get("paymentKey");
      const orderId = sp.get("orderId");
      const amountRaw = sp.get("amount");
      if (!paymentKey || !orderId || !amountRaw) {
        if (!cancelled) {
          setResult({
            ok: false,
            message: "결제 확인에 필요한 정보가 없습니다.",
            params: Object.fromEntries(sp.entries()),
          });
        }
        return;
      }
      const amount = Number(amountRaw);
      if (!Number.isFinite(amount)) {
        if (!cancelled) {
          setResult({
            ok: false,
            message: "결제 금액 정보가 올바르지 않습니다.",
            params: Object.fromEntries(sp.entries()),
          });
        }
        return;
      }

      const r = await confirmTossPayment({ paymentKey, orderId, amount });
      // 결제 성공(또는 이미 paid) 시 서버 cart_items는 비워지므로,
      // 로컬 장바구니 스토어도 함께 비워서 UI 불일치를 제거한다.
      if (r.ok) clearCart();
      if (!cancelled) setResult(r);
    })();
    return () => {
      cancelled = true;
    };
  }, [sp]);

  const title = useMemo(() => {
    if (result == null) return checkoutMessages.paymentVerifying;
    if (!isConfirmOk(result)) return result.message;
    return result.ok ? result.message : result.message;
  }, [result]);

  const orderId = useMemo(() => {
    if (result && isConfirmOk(result) && result.ok) return String(result.data.orderId ?? "");
    return sp.get("orderId") ?? "";
  }, [result, sp]);

  const amount = useMemo(() => {
    const v = sp.get("amount");
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  }, [sp]);

  return (
    <main className="mx-auto max-w-[1120px] px-4 py-20 sm:px-8">
      <header className="text-center">
        <h1
          style={{
            fontFamily: "Poppins",
            fontWeight: 500,
            fontSize: 54,
            lineHeight: "58px",
            letterSpacing: "-1px",
            color: commerceColors.text.primary,
          }}
        >
          Complete!
        </h1>
        <CheckoutProgress currentStep={3} />
      </header>

      <section
        className={cn("mx-auto mt-20 w-full max-w-[738px] rounded-lg border bg-white")}
        style={{ borderColor: commerceColors.border.subtle, backgroundColor: commerceColors.background.default }}
        aria-label="결제 완료"
      >
        <div className="px-6 pb-10 pt-12 sm:px-12 sm:pt-16">
          <div className="flex flex-col items-center text-center">
            <FiCheckCircle
              className="mb-4 size-10"
              style={{ color: commerceColors.semantic.success }}
              aria-hidden
            />
            <p
              style={{
                fontFamily: "Poppins",
                fontWeight: 500,
                fontSize: 28,
                lineHeight: "34px",
                letterSpacing: "-0.6px",
                color: commerceColors.text.secondary,
              }}
            >
              Thank you!
            </p>
            <h1
              className="mt-2"
              style={{
                fontFamily: "Poppins",
                fontWeight: 500,
                fontSize: 40,
                lineHeight: "44px",
                letterSpacing: "-0.4px",
                color: commerceColors.primary.light,
              }}
            >
              {title}
            </h1>
          </div>

          <div className="mx-auto mt-10 w-full max-w-[548px]">
            <div className="grid grid-cols-2 gap-x-10 gap-y-4 sm:grid-cols-[120px_1fr]">
              <div
                style={{
                  ...typographyToStyle(commerceTypography.caption1Semi),
                  color: commerceColors.text.secondary,
                  lineHeight: "22px",
                }}
              >
                Order code:
              </div>
              <div
                style={{
                  ...typographyToStyle(commerceTypography.caption1Semi),
                  color: commerceColors.text.primary,
                  lineHeight: "22px",
                }}
              >
                {orderId || "-"}
              </div>

              <div
                style={{
                  ...typographyToStyle(commerceTypography.caption1Semi),
                  color: commerceColors.text.secondary,
                  lineHeight: "22px",
                }}
              >
                Date:
              </div>
              <div
                style={{
                  ...typographyToStyle(commerceTypography.caption1Semi),
                  color: commerceColors.text.primary,
                  lineHeight: "22px",
                }}
              >
                {new Date().toLocaleDateString("ko-KR")}
              </div>

              <div
                style={{
                  ...typographyToStyle(commerceTypography.caption1Semi),
                  color: commerceColors.text.secondary,
                  lineHeight: "22px",
                }}
              >
                Total:
              </div>
              <div
                style={{
                  ...typographyToStyle(commerceTypography.caption1Semi),
                  color: commerceColors.text.primary,
                  lineHeight: "22px",
                }}
              >
                {amount == null ? "-" : `${amount.toLocaleString("ko-KR")}원`}
              </div>

              <div
                style={{
                  ...typographyToStyle(commerceTypography.caption1Semi),
                  color: commerceColors.text.secondary,
                  lineHeight: "22px",
                }}
              >
                Payment method:
              </div>
              <div
                style={{
                  ...typographyToStyle(commerceTypography.caption1Semi),
                  color: commerceColors.text.primary,
                  lineHeight: "22px",
                }}
              >
                TossPayments · Card
              </div>
            </div>
          </div>

          <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link
              href={ACCOUNT_URLS.ORDERS}
              aria-label="주문목록으로 이동"
            >
              <Button
                className="h-[52px] w-full rounded-[80px] sm:w-auto"
                style={{
                  backgroundColor: commerceColors.primary.main,
                  color: commerceColors.text.inverse,
                  minWidth: 203,
                }}
              >
                주문목록
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

