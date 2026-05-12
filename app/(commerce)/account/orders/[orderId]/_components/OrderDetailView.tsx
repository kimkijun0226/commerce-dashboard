import Image from "next/image";
import Link from "next/link";
import { commerceColors } from "@/commons/constants/color";
import { commerceTypography } from "@/commons/constants/typography";
import { ACCOUNT_URLS, COMMERCE_URLS } from "@/commons/constants/url";
import { OrderStatusBadge } from "@/components/account/OrderStatusBadge";
import { PaymentStatusBadge } from "@/components/account/PaymentStatusBadge";
import { cn, typographyToStyle } from "@/components/ui";
import type { OrderDetail } from "../queries";

function orderCode(id: string) {
  const s = String(id);
  return `#${s.replace(/-/g, "").slice(-8).toUpperCase()}`;
}

function formatDate(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatDateTime(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString("ko-KR");
}

function formatMoney(n: number, currency = "KRW") {
  const sym = currency === "KRW" ? "₩" : `${currency} `;
  return `${sym}${Math.round(n).toLocaleString("ko-KR")}`;
}

function cardClassName() {
  return "rounded-lg border border-(--commerce-border-subtle) bg-white p-6";
}

function sectionTitle(text: string, id?: string) {
  return (
    <h2
      id={id}
      className="mb-4"
      style={{
        ...typographyToStyle(commerceTypography.headline7),
        color: commerceColors.text.primary,
      }}
    >
      {text}
    </h2>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
      <span style={{ ...typographyToStyle(commerceTypography.body2), color: commerceColors.text.secondary }}>
        {label}
      </span>
      <span
        className="min-w-0 break-words text-left sm:text-right"
        style={{ ...typographyToStyle(commerceTypography.body2Semi), color: commerceColors.text.primary }}
      >
        {value}
      </span>
    </div>
  );
}

export function OrderDetailView({
  detail,
  reviewableProductIds,
}: {
  detail: OrderDetail;
  reviewableProductIds: ReadonlySet<string>;
}) {
  const { order, items, payment } = detail;
  const code = orderCode(order.id);

  const shipLines = [
    order.shippingName,
    order.shippingPhone,
    [order.shippingAddressLine1, order.shippingAddressLine2].filter(Boolean).join(" "),
    [order.shippingCity, order.shippingState, order.shippingZip].filter(Boolean).join(" "),
    order.shippingCountry,
  ]
    .map((s) => (typeof s === "string" ? s.trim() : ""))
    .filter(Boolean);

  const contactLines = [order.contactName, order.contactPhone, order.contactEmail]
    .map((s) => (typeof s === "string" ? s.trim() : ""))
    .filter(Boolean);

  return (
    <div className="flex flex-col gap-6">
      <nav aria-label="Breadcrumb">
        <ol
          className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[14px] font-medium leading-[22px]"
          style={{ color: commerceColors.text.secondary }}
        >
          <li>
            <Link href={ACCOUNT_URLS.ACCOUNT} className="hover:text-(--commerce-text-primary)">
              My Account
            </Link>
          </li>
          <li aria-hidden className="text-(--commerce-border-strong)">
            /
          </li>
          <li>
            <Link href={ACCOUNT_URLS.ORDERS} className="hover:text-(--commerce-text-primary)">
              Orders
            </Link>
          </li>
          <li aria-hidden className="text-(--commerce-border-strong)">
            /
          </li>
          <li className="text-(--commerce-text-primary)" aria-current="page">
            {code}
          </li>
        </ol>
      </nav>

      <section className={cardClassName()}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <p
              className="text-[12px] font-semibold uppercase tracking-wide text-(--commerce-text-secondary)"
              style={typographyToStyle(commerceTypography.caption1Semi)}
            >
              Order number
            </p>
            <h2
              className="mt-1 truncate text-[28px] font-medium leading-9 tracking-[-0.5px] text-black sm:text-[32px] sm:leading-10"
              style={{ fontFamily: "var(--commerce-font-heading)" }}
            >
              {code}
            </h2>
            <p className="mt-2" style={{ ...typographyToStyle(commerceTypography.body2), color: commerceColors.text.secondary }}>
              {formatDate(order.createdAt)}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <OrderStatusBadge status={order.status} />
            <PaymentStatusBadge kind="order" status={order.paymentStatus} />
          </div>
        </div>
      </section>

      <section className={cardClassName()} aria-labelledby="order-summary-heading">
        {sectionTitle("Order Summary", "order-summary-heading")}
        <div className="flex flex-col gap-3">
          <InfoRow label="Items total" value={formatMoney(order.subtotalAmount, order.currency)} />
          <InfoRow label="Shipping" value={formatMoney(order.shippingFee, order.currency)} />
          <InfoRow
            label="Discount"
            value={
              order.discountAmount > 0
                ? `- ${formatMoney(order.discountAmount, order.currency)}`
                : formatMoney(0, order.currency)
            }
          />
          <div className="h-px w-full bg-(--commerce-border-subtle)" aria-hidden />
          <div className="flex items-center justify-between gap-4">
            <span style={{ ...typographyToStyle(commerceTypography.body2Semi), color: commerceColors.text.primary }}>
              Total
            </span>
            <span className="tabular-nums" style={{ ...typographyToStyle(commerceTypography.body2Semi), color: commerceColors.text.primary }}>
              {formatMoney(order.totalAmount, order.currency)}
            </span>
          </div>
        </div>
      </section>

      <section className={cardClassName()} aria-labelledby="order-products-heading">
        {sectionTitle("Products in this order", "order-products-heading")}
        {items.length === 0 ? (
          <p style={{ ...typographyToStyle(commerceTypography.body2), color: commerceColors.text.secondary }}>
            이 주문에 등록된 상품이 없습니다.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] border-collapse text-left">
              <thead>
                <tr className="border-b border-(--commerce-border-subtle)">
                  <th className="pb-3 pr-4" style={{ ...typographyToStyle(commerceTypography.caption1Semi), color: commerceColors.text.secondary }}>
                    Product
                  </th>
                  <th className="pb-3 px-2 text-center" style={{ ...typographyToStyle(commerceTypography.caption1Semi), color: commerceColors.text.secondary }}>
                    Qty
                  </th>
                  <th className="pb-3 px-2 text-right" style={{ ...typographyToStyle(commerceTypography.caption1Semi), color: commerceColors.text.secondary }}>
                    Unit price
                  </th>
                  <th className="pb-3 px-2 text-right" style={{ ...typographyToStyle(commerceTypography.caption1Semi), color: commerceColors.text.secondary }}>
                    Line total
                  </th>
                  <th className="pb-3 pl-2 text-right align-middle" style={{ ...typographyToStyle(commerceTypography.caption1Semi), color: commerceColors.text.secondary }}>
                    상품평
                  </th>
                </tr>
              </thead>
              <tbody>
                {items.map((it) => {
                  const unit = it.unitSalePrice ?? it.unitPrice;
                  const img = it.productImageUrl;
                  return (
                    <tr key={it.id} className="border-b border-(--commerce-border-subtle) last:border-b-0">
                      <td className="py-4 pr-4">
                        <div className="flex items-center gap-3">
                          <div className="relative size-14 shrink-0 overflow-hidden rounded-md bg-(--commerce-background-light)">
                            {img ? (
                              <Image
                                src={img}
                                alt={it.productName ?? "상품 이미지"}
                                fill
                                className="object-cover"
                                sizes="56px"
                                unoptimized={
                                  img.startsWith("http://") ||
                                  img.startsWith("https://") ||
                                  img.startsWith("data:")
                                }
                              />
                            ) : null}
                          </div>
                          <div className="min-w-0">
                            <Link
                              href={COMMERCE_URLS.PRODUCT_DETAIL(it.productId)}
                              className="line-clamp-2 hover:text-(--commerce-primary-main)"
                              style={{ ...typographyToStyle(commerceTypography.body2Semi), color: commerceColors.text.primary }}
                            >
                              {it.productName ?? "상품"}
                            </Link>
                          </div>
                        </div>
                      </td>
                      <td className="px-2 py-4 text-center tabular-nums" style={{ ...typographyToStyle(commerceTypography.body2), color: commerceColors.text.primary }}>
                        {it.quantity}
                      </td>
                      <td className="px-2 py-4 text-right tabular-nums" style={{ ...typographyToStyle(commerceTypography.body2), color: commerceColors.text.primary }}>
                        {formatMoney(unit, order.currency)}
                      </td>
                      <td className="px-2 py-4 text-right tabular-nums" style={{ ...typographyToStyle(commerceTypography.body2Semi), color: commerceColors.text.primary }}>
                        {formatMoney(it.lineSubtotal, order.currency)}
                      </td>
                      <td className="pl-2 py-4 text-right align-middle">
                        {reviewableProductIds.has(it.productId) ? (
                          <Link
                            href={COMMERCE_URLS.PRODUCT_DETAIL_REVIEW_WRITE(it.productId, order.id)}
                            className="inline-flex min-w-[100px] items-center justify-center rounded-full border border-(--commerce-border-strong) px-3 py-1.5 text-[13px] font-semibold text-(--commerce-text-primary) transition-colors hover:bg-(--commerce-background-light) focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--commerce-semantic-info)"
                            style={typographyToStyle(commerceTypography.caption1Semi)}
                          >
                            상품평 작성
                          </Link>
                        ) : (
                          <span
                            className="text-[13px] text-(--commerce-text-muted)"
                            style={typographyToStyle(commerceTypography.caption1)}
                          >
                            —
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className={cardClassName()} aria-labelledby="shipping-heading">
        {sectionTitle("Shipping Information", "shipping-heading")}
        <div className="flex flex-col gap-3">
          {shipLines.length > 0
            ? shipLines.map((line, i) => (
                <p
                  key={`ship-${i}-${line.slice(0, 24)}`}
                  style={{ ...typographyToStyle(commerceTypography.body2), color: commerceColors.text.primary }}
                >
                  {line}
                </p>
              ))
            : null}
          {shipLines.length === 0 && contactLines.length === 0 ? (
            <p style={{ ...typographyToStyle(commerceTypography.body2), color: commerceColors.text.secondary }}>
              등록된 배송·연락처 정보가 없습니다.
            </p>
          ) : null}
          {contactLines.length > 0 ? (
            <>
              <div className="my-2 h-px w-full bg-(--commerce-border-subtle)" aria-hidden />
              <p
                className="text-[12px] font-semibold uppercase tracking-wide text-(--commerce-text-secondary)"
                style={typographyToStyle(commerceTypography.caption1Semi)}
              >
                주문자 정보
              </p>
              {contactLines.map((line, i) => (
                <p
                  key={`contact-${i}-${line.slice(0, 24)}`}
                  style={{ ...typographyToStyle(commerceTypography.body2), color: commerceColors.text.primary }}
                >
                  {line}
                </p>
              ))}
            </>
          ) : null}
        </div>
      </section>

      <section className={cardClassName()} aria-labelledby="payment-heading">
        {sectionTitle("Payment Information", "payment-heading")}
        {payment ? (
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <PaymentStatusBadge kind="payment" status={payment.status} />
            </div>
            <div className="flex flex-col gap-3">
              <InfoRow label="Provider" value={payment.provider} />
              <InfoRow label="Method" value={payment.method} />
              <InfoRow label="Amount" value={formatMoney(payment.amount, payment.currency)} />
              <InfoRow label="Requested at" value={formatDateTime(payment.createdAt)} />
              <InfoRow
                label="Approved at"
                value={payment.approvedAt ? formatDateTime(payment.approvedAt) : "—"}
              />
              <InfoRow label="Transaction ID" value={payment.transactionId ?? "—"} />
            </div>
          </div>
        ) : (
          <p style={{ ...typographyToStyle(commerceTypography.body2), color: commerceColors.text.secondary }}>
            결제 기록이 없습니다.
          </p>
        )}
      </section>

      <div className="flex justify-end">
        <Link
          href={ACCOUNT_URLS.ORDERS}
          className={cn(
            "inline-flex items-center justify-center rounded-[80px] border border-(--commerce-border-strong) px-5 py-2.5",
            "text-[14px] font-semibold leading-[22px] text-(--commerce-text-primary) transition-colors hover:bg-(--commerce-background-light)",
          )}
        >
          주문 목록으로
        </Link>
      </div>
    </div>
  );
}
