"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { FiXCircle } from "react-icons/fi";
import { commerceColors } from "@/commons/constants/color";
import { commerceTypography } from "@/commons/constants/typography";
import { COMMERCE_URLS } from "@/commons/constants/url";
import { checkoutMessages } from "@/commons/constants/checkoutMessages";
import { Button, cn, typographyToStyle } from "@/components/ui";
import { clearSessionPendingOrderId, getSessionPendingOrderId } from "@/commons/utils/order";
import { markTossPaymentFailed, type MarkTossPaymentFailedResult } from "../toss-payment-actions";
import { CheckoutProgress } from "@/components/commerce/CheckoutProgress";

export function CheckoutFailClient() {
  const sp = useSearchParams();
  const [serverResult, setServerResult] = useState<MarkTossPaymentFailedResult | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const tossOrderIdFromQuery = sp.get("orderId");
      const tossOrderId = tossOrderIdFromQuery || getSessionPendingOrderId();
      const r = await markTossPaymentFailed({
        tossOrderId,
        code: sp.get("code"),
        message: sp.get("message"),
      });
      clearSessionPendingOrderId();
      if (!cancelled) setServerResult(r);
    })();
    return () => {
      cancelled = true;
    };
  }, [sp]);

  const title = useMemo(() => {
    if (serverResult == null) return checkoutMessages.paymentVerifying;
    return serverResult.message || checkoutMessages.paymentFailed;
  }, [serverResult]);

  const details = useMemo(() => {
    const code = sp.get("code");
    const message = sp.get("message");
    const orderId = sp.get("orderId") || getSessionPendingOrderId();
    return { code, message, orderId };
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
        aria-label="결제 실패"
      >
        <div className="px-6 pb-10 pt-12 sm:px-12 sm:pt-16">
          <div className="flex flex-col items-center text-center">
            <FiXCircle
              className="mb-4 size-10"
              style={{ color: commerceColors.semantic.danger }}
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
              Oops!
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
              <div style={{ ...typographyToStyle(commerceTypography.caption1Semi), color: commerceColors.text.secondary, lineHeight: "22px" }}>
                Code:
              </div>
              <div style={{ ...typographyToStyle(commerceTypography.caption1Semi), color: commerceColors.text.primary, lineHeight: "22px" }}>
                {details.code || "-"}
              </div>
              <div style={{ ...typographyToStyle(commerceTypography.caption1Semi), color: commerceColors.text.secondary, lineHeight: "22px" }}>
                Message:
              </div>
              <div style={{ ...typographyToStyle(commerceTypography.caption1Semi), color: commerceColors.text.primary, lineHeight: "22px" }}>
                {details.message || "-"}
              </div>
              <div style={{ ...typographyToStyle(commerceTypography.caption1Semi), color: commerceColors.text.secondary, lineHeight: "22px" }}>
                Order ID:
              </div>
              <div style={{ ...typographyToStyle(commerceTypography.caption1Semi), color: commerceColors.text.primary, lineHeight: "22px" }}>
                {details.orderId || "-"}
              </div>
            </div>
          </div>

          <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Button
              className="h-[52px] w-full rounded-[80px] sm:w-auto"
              style={{
                backgroundColor: commerceColors.primary.main,
                color: commerceColors.text.inverse,
                minWidth: 203,
              }}
              aria-label="장바구니로 이동"
              onClick={() => {
                window.location.href = COMMERCE_URLS.CART;
              }}
            >
              장바구니로
            </Button>
            <Link
              href={COMMERCE_URLS.CHECKOUT}
              className="inline-flex h-[52px] w-full items-center justify-center rounded-[80px] border px-6 sm:w-auto"
              style={{
                borderColor: commerceColors.border.subtle,
                ...typographyToStyle(commerceTypography.buttonS),
                color: commerceColors.text.primary,
                backgroundColor: commerceColors.background.default,
              }}
              aria-label="다시 결제하기"
            >
              다시 결제하기
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

