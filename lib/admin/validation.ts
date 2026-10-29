import {
  parseProductOptions,
  parseOptionEditor,
} from "@/commons/utils/productOptions";
import { parseSearchKeywords } from "@/lib/catalog/keywords";
import type { StoreKey } from "@/lib/catalog/storefront";

export function imageUrl(value: string, required = false) {
  const raw = value.trim();
  if (!raw && !required) return "";
  if (
    /^\/(brand|campaigns)\/[a-zA-Z0-9/_.-]+$/.test(raw) &&
    !raw.split("/").some((part) => part === ".." || part === ".")
  )
    return raw;
  try {
    const url = new URL(raw);
    if (
      url.protocol === "https:" &&
      !url.username &&
      !url.password &&
      raw.length <= 2048
    )
      return raw;
  } catch {}
  throw new Error("이미지는 HTTPS 주소 또는 업로드한 이미지로 지정해 주세요.");
}
export function readProductForm(form: FormData) {
  const name = String(form.get("name") ?? "").trim();
  const department = String(form.get("department") ?? "");
  const status = String(form.get("status") ?? "");
  const price = Number(form.get("price"));
  const saleRaw = String(form.get("salePrice") ?? "").trim();
  const sale_price = saleRaw ? Number(saleRaw) : null;
  const brand = String(form.get("brand") ?? "").trim();
  const description = String(form.get("description") ?? "").trim();
  if (
    !name ||
    name.length > 200 ||
    brand.length > 100 ||
    description.length > 10000
  )
    throw new Error(
      "상품명은 1~200자, 브랜드는 100자, 설명은 10,000자까지 입력해 주세요.",
    );
  if (!["fashion", "beauty", "home"].includes(department))
    throw new Error("매장을 선택해 주세요.");
  if (!["registered", "hidden", "sold_out"].includes(status))
    throw new Error("판매 상태를 선택해 주세요.");
  if (
    !Number.isSafeInteger(price) ||
    price < 1 ||
    price > 1_000_000_000 ||
    (sale_price !== null &&
      (!Number.isSafeInteger(sale_price) ||
        sale_price < 1 ||
        sale_price > price))
  )
    throw new Error(
      "판매가는 1원 이상, 할인가는 판매가 이하의 정수로 입력해 주세요.",
    );
  const categories = [
    ...new Set(
      String(form.get("categories") ?? "")
        .split(/[,\n]/)
        .map((v) => v.trim())
        .filter(Boolean),
    ),
  ];
  if (
    !categories.length ||
    categories.length > 8 ||
    categories.some((v) => v.length > 50)
  )
    throw new Error("카테고리는 1~8개, 각 50자까지 입력해 주세요.");
  const details = String(form.get("detailImages") ?? "")
    .split(/\n/)
    .map((v) => v.trim())
    .filter(Boolean);
  if (details.length > 12)
    throw new Error("상세 이미지는 12개까지 등록할 수 있습니다.");
  return {
    name,
    department: department as StoreKey,
    status: status as "registered" | "hidden" | "sold_out",
    price,
    sale_price,
    brand,
    description,
    categories,
    image_url: imageUrl(String(form.get("imageUrl") ?? ""), true),
    detail_image_urls: details.map((v) => imageUrl(v, true)),
    search_keywords: parseSearchKeywords(String(form.get("keywords") ?? "")),
    options: parseOptionEditor(String(form.get("options") ?? "")).map((v) => ({
      ...v,
    })),
  };
}
export const FULFILLMENT_LABELS: Record<string, string> = {
  unfulfilled: "미처리",
  preparing: "상품 준비중",
  shipped: "배송중",
  delivered: "배송완료",
  on_hold: "보류",
};
export function readFulfillmentForm(
  form: FormData,
  paid: boolean,
  previous: string,
) {
  const fulfillment_status = String(form.get("fulfillmentStatus") ?? "");
  const shipping_carrier = String(form.get("shippingCarrier") ?? "").trim();
  const tracking_number = String(form.get("trackingNumber") ?? "").trim();
  if (
    !Object.hasOwn(FULFILLMENT_LABELS, fulfillment_status) ||
    shipping_carrier.length > 50 ||
    tracking_number.length > 100
  )
    throw new Error("올바른 배송 정보를 입력해 주세요.");
  if (!["unfulfilled", "on_hold"].includes(fulfillment_status) && !paid)
    throw new Error("결제가 완료된 주문만 배송 처리할 수 있습니다.");
  if (
    ["shipped", "delivered"].includes(fulfillment_status) &&
    (!shipping_carrier || !tracking_number)
  )
    throw new Error("배송사와 송장번호를 입력해 주세요.");
  if (previous === "delivered" && fulfillment_status !== "delivered")
    throw new Error("배송 완료된 주문은 이전 단계로 되돌릴 수 없습니다.");
  return {
    fulfillment_status,
    shipping_carrier: shipping_carrier || null,
    tracking_number: tracking_number || null,
  };
}
export { parseProductOptions };
