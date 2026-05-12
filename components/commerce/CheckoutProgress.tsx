"use client";

import { commerceColors } from "@/commons/constants/color";
import { commerceTypography } from "@/commons/constants/typography";
import { cn } from "@/components/ui";

export type CheckoutProgressProps = {
  currentStep: 1 | 2 | 3;
  className?: string;
};

type StepState = "done" | "current" | "todo";

function stateFor(step: 1 | 2 | 3, current: 1 | 2 | 3): StepState {
  if (step < current) return "done";
  if (step === current) return "current";
  return "todo";
}

export function CheckoutProgress({ currentStep, className }: CheckoutProgressProps) {
  const steps = [
    { n: 1 as const, label: "장바구니" },
    { n: 2 as const, label: "결제 정보" },
    { n: 3 as const, label: "주문 완료" },
  ];

  return (
    <ol
      className={cn(
        "mx-auto mt-10 grid max-w-[832px] grid-cols-1 gap-2 sm:grid-cols-3 sm:gap-6",
        className,
      )}
    >
      {steps.map((s) => {
        const st = stateFor(s.n, currentStep);
        const labelColor =
          st === "done"
            ? commerceColors.semantic.success
            : st === "current"
              ? commerceColors.text.primary ?? commerceColors.primary.light
              : commerceColors.text.secondary;
        const accent =
          st === "done"
            ? commerceColors.semantic.success
            : st === "current"
              ? "#111827"
              : commerceColors.border.subtle;
        const statusText = st === "done" ? "완료" : st === "current" ? "진행 중" : "예정";
        const statusColor =
          st === "done"
            ? commerceColors.semantic.success
            : st === "current"
              ? "#111827"
              : commerceColors.text.secondary;

        return (
          <li
            key={s.n}
            className={cn(
              "group relative px-4 py-3 sm:px-0 sm:py-0",
            )}
            aria-label={
              st === "done"
                ? `${s.label} 완료`
                : st === "current"
                  ? `${s.label} 진행 중`
                  : `${s.label} 예정`
            }
            aria-current={st === "current" ? "step" : undefined}
          >
            <div className={cn("checkout-row", st === "current" && "is-current")}>
              <span
                className={cn(
                  "text-[15px] font-semibold leading-[22px] tracking-[-0.03em] sm:text-base sm:leading-[26px]",
                  st === "todo" && "opacity-70",
                )}
                style={{
                  fontFamily: commerceTypography.body2Semi.fontFamily,
                  color: st === "todo" ? commerceColors.text.secondary : commerceColors.text.primary ?? labelColor,
                }}
              >
                {s.label}
              </span>

              <span
                className={cn("checkout-badge", st)}
                style={{ color: statusColor }}
                aria-hidden
              >
                {st === "done" ? (
                  <svg className="checkout-mini-check" width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M20 6L9 17l-5-5"
                      stroke={commerceColors.semantic.success}
                      strokeWidth="2.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                ) : null}
                {statusText}
                {st === "current" ? (
                  <span className="checkout-dots" aria-hidden>
                    <span className="dot" />
                    <span className="dot" />
                    <span className="dot" />
                  </span>
                ) : null}
              </span>
            </div>
          </li>
        );
      })}
      <style jsx>{`
        .checkout-row {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 14px;
          padding: 10px 0;
          border-bottom: 1px solid rgba(148, 163, 184, 0.22);
        }
        .checkout-row.is-current {
          border-bottom-color: rgba(17, 24, 39, 0.12);
        }
        .checkout-row.is-current:after {
          content: "";
          position: absolute;
          left: 0;
          bottom: -1px;
          height: 2px;
          width: 100%;
          border-radius: 999px;
          background: linear-gradient(90deg, rgba(17, 24, 39, 0.55), rgba(17, 24, 39, 0));
          opacity: 0.32;
        }
        .checkout-row.is-current:before {
          content: "";
          position: absolute;
          left: 0;
          bottom: -1px;
          height: 2px;
          width: 22%;
          border-radius: 999px;
          background: linear-gradient(
            90deg,
            rgba(17, 24, 39, 0) 0%,
            rgba(17, 24, 39, 0.28) 28%,
            rgba(17, 24, 39, 0.95) 50%,
            rgba(17, 24, 39, 0.28) 72%,
            rgba(17, 24, 39, 0) 100%
          );
          filter: blur(0.2px);
          opacity: 0.9;
          animation: checkoutWave 1.55s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }
        @keyframes checkoutWave {
          0% {
            transform: translateX(0%);
            opacity: 0.25;
          }
          10% {
            opacity: 0.95;
          }
          70% {
            opacity: 0.9;
          }
          92% {
            opacity: 0.75;
          }
          100% {
            transform: translateX(355%);
            opacity: 0;
          }
        }

        .checkout-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 6px 10px;
          border-radius: 999px;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: -0.01em;
          background: rgba(148, 163, 184, 0.12);
          color: ${commerceColors.text.secondary};
          line-height: 1;
          user-select: none;
          transform: translateY(1px);
        }
        .checkout-badge.done {
          background: rgba(34, 197, 94, 0.10);
        }
        .checkout-badge.current {
          background: rgba(17, 24, 39, 0.06);
        }
        .checkout-badge.todo {
          background: rgba(148, 163, 184, 0.10);
        }
        .checkout-mini-check path {
          stroke-dasharray: 40;
          stroke-dashoffset: 40;
          animation: checkoutDraw 360ms ease-out forwards;
        }

        .checkout-dots {
          display: inline-flex;
          gap: 6px;
          align-items: center;
          margin-left: 2px;
        }
        .checkout-dots .dot {
          width: 4px;
          height: 4px;
          border-radius: 999px;
          background: rgba(17, 24, 39, 0.9);
          opacity: 0.25;
          animation: checkoutDotPulse 1.1s infinite ease-in-out;
        }
        .checkout-dots .dot:nth-child(1) {
          animation-delay: 0ms;
        }
        .checkout-dots .dot:nth-child(2) {
          animation-delay: 140ms;
        }
        .checkout-dots .dot:nth-child(3) {
          animation-delay: 280ms;
        }
        @keyframes checkoutDotPulse {
          0%,
          100% {
            opacity: 0.25;
            transform: translateY(0) scale(0.9);
          }
          50% {
            opacity: 1;
            transform: translateY(-1px) scale(1.12);
          }
        }

        .checkout-check path {
          stroke-dasharray: 40;
          stroke-dashoffset: 40;
          animation: checkoutDraw 420ms ease-out forwards;
        }
        @keyframes checkoutDraw {
          to {
            stroke-dashoffset: 0;
          }
        }
        .checkout-progress-pop {
          animation: checkoutPop 220ms ease-out;
        }
        @keyframes checkoutPop {
          0% {
            transform: scale(0.92);
          }
          70% {
            transform: scale(1.08);
          }
          100% {
            transform: scale(1);
          }
        }
      `}</style>
    </ol>
  );
}

