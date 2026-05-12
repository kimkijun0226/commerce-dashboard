"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { buildCheckoutOrderName } from "@/commons/utils/order";
import { createClient } from "@/lib/supabase/server";
import {
  computeTotals,
  normalizeMoney,
  type LineItem,
  type PricingTotals,
} from "@/lib/commerce/pricing";

export type CheckoutSubmitPayload = {
  form: {
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
  clientTotals: PricingTotals;
  address:
    | { mode: "saved"; addressId: string }
    | { mode: "new"; save: boolean; setDefault: boolean; label?: string };
};

type CartRow = {
  product_id: string;
  quantity: number;
  products: {
    id: string;
    name: string;
    price: number;
    sale_price: number | null;
    image_url: string | null;
    status: "registered" | "hidden" | "sold_out";
  } | null;
};

function validate(payload: CheckoutSubmitPayload) {
  const f = payload.form;
  if (!f.contactName.trim()) throw new Error("VALIDATION:이름을 입력해 주세요.");
  if (!f.contactPhone.trim()) throw new Error("VALIDATION:연락처를 입력해 주세요.");
  if (!f.contactEmail.trim()) throw new Error("VALIDATION:이메일을 입력해 주세요.");
  if (!f.agreeToTerms) throw new Error("VALIDATION:약관 동의가 필요합니다.");
}

function moneyEq(a: number, b: number) {
  return normalizeMoney(a) === normalizeMoney(b);
}

async function upsertRecentAddress(args: {
  sb: { from: (table: string) => any };
  userId: string;
  shippingName: string;
  shippingPhone: string;
  addressLine1: string;
  addressLine2: string | null;
  memo: string | null;
}) {
  const { sb, userId, shippingName, shippingPhone, addressLine1, addressLine2, memo } = args;

  // 동일한 배송지가 있으면 updated_at만 갱신(=최신으로 올리기), 없으면 "최근 배송지"로 저장
  const { data: existing } = await sb
    .from("user_addresses")
    .select("id,label")
    .eq("user_id", userId)
    .eq("recipient_name", shippingName)
    .eq("recipient_phone", shippingPhone)
    .eq("address_line1", addressLine1)
    .eq("address_line2", addressLine2)
    .limit(1)
    .maybeSingle();

  if (existing?.id) {
    await sb
      .from("user_addresses")
      .update({
        // 값이 같아도 update를 통해 updated_at 트리거가 동작해 최신으로 올라간다.
        memo,
        label: existing.label ?? "최근 배송지",
      })
      .eq("id", existing.id)
      .eq("user_id", userId);
    return;
  }

  const { count } = await sb
    .from("user_addresses")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId);
  if ((count ?? 0) >= 10) return;

  await sb.from("user_addresses").insert({
    user_id: userId,
    label: "최근 배송지",
    recipient_name: shippingName,
    recipient_phone: shippingPhone,
    address_line1: addressLine1,
    address_line2: addressLine2,
    memo: memo,
    is_default: false,
  });
}

export type FindOrCreateOrderResult = {
  orderId: string;
  tossOrderId: string;
  amount: number;
  orderName: string;
};

export async function findOrCreateOrder(payload: CheckoutSubmitPayload): Promise<FindOrCreateOrderResult> {
  validate(payload);

  const supabase = await createClient();
  const sb = supabase as unknown as { from: (table: string) => any };
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) throw new Error("AUTH_REQUIRED:로그인이 필요합니다.");

  // 장바구니 조회(+상품 조인)
  const { data, error } = await supabase
    .from("cart_items")
    .select(
      `
      product_id,
      quantity,
      products (
        id,
        name,
        price,
        sale_price,
        image_url,
        status
      )
    `,
    )
    .eq("user_id", user.id);

  if (error) throw new Error(`CART_READ_FAIL:${error.message}`);

  const raw = ((data ?? []) as unknown as CartRow[])
    .map((row) => ({ row, p: row.products }))
    .filter((x) => x.p && x.p.status !== "hidden");

  const items: LineItem[] = raw.map(({ row, p }) => ({
    productId: row.product_id,
    name: p!.name,
    imageUrl: p!.image_url,
    quantity: Math.max(1, Math.floor(Number(row.quantity) || 1)),
    unitPrice: normalizeMoney(p!.price),
    unitSalePrice: p!.sale_price == null ? null : normalizeMoney(p!.sale_price),
  }));

  if (items.length === 0) throw new Error("EMPTY_CART:장바구니가 비어 있습니다.");

  const serverTotals = computeTotals(items, 0);
  const clientTotals = payload.clientTotals;

  const totalsMatch =
    moneyEq(serverTotals.subtotal, clientTotals.subtotal) &&
    moneyEq(serverTotals.shipping, clientTotals.shipping) &&
    moneyEq(serverTotals.discount, clientTotals.discount) &&
    moneyEq(serverTotals.total, clientTotals.total);

  if (!totalsMatch) {
    throw new Error("PRICE_MISMATCH:가격이 변경되었습니다. 새로고침 후 다시 시도해 주세요.");
  }

  // 배송지 확정 (저장된 배송지는 서버에서 다시 조회해서 스냅샷)
  let shippingName = payload.form.shippingName.trim();
  let shippingPhone = payload.form.shippingPhone.trim();
  let addressLine1 = payload.form.addressLine1.trim();
  let addressLine2 = payload.form.addressLine2?.trim() || null;
  let memo = payload.form.memo?.trim() || null;

  if (payload.address.mode === "saved") {
    const { data: addr, error: addrErr } = await sb
      .from("user_addresses")
      .select("address_line1, address_line2, memo")
      .eq("id", payload.address.addressId)
      .eq("user_id", user.id)
      .single();
    if (addrErr || !addr) {
      throw new Error("ADDRESS_NOT_FOUND:선택한 배송지를 찾을 수 없습니다.");
    }
    addressLine1 = String(addr.address_line1 ?? "").trim();
    addressLine2 = addr.address_line2 ? String(addr.address_line2).trim() : null;
    memo = addr.memo ? String(addr.memo).trim() : null;
  } else {
    // new mode: 입력값 검증
    if (!shippingName) throw new Error("VALIDATION:받는 분을 입력해 주세요.");
    if (!shippingPhone) throw new Error("VALIDATION:배송 연락처를 입력해 주세요.");
    if (!addressLine1) throw new Error("VALIDATION:주소를 입력해 주세요.");

    // 저장 옵션
    if (payload.address.save) {
      const { count } = await sb
        .from("user_addresses")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id);
      if ((count ?? 0) >= 10) {
        throw new Error("LIMIT:주소는 최대 10개까지 저장할 수 있습니다.");
      }

      if (payload.address.setDefault) {
        await sb
          .from("user_addresses")
          .update({ is_default: false })
          .eq("user_id", user.id);
      }

      const { error: saveErr } = await sb.from("user_addresses").insert({
        user_id: user.id,
        label: payload.address.label?.trim() || null,
        recipient_name: shippingName,
        recipient_phone: shippingPhone,
        address_line1: addressLine1,
        address_line2: addressLine2,
        memo: memo,
        is_default: Boolean(payload.address.setDefault),
      });
      if (saveErr) {
        const msg = saveErr.message ?? "주소 저장에 실패했습니다.";
        if (msg.includes("USER_ADDRESSES_LIMIT_EXCEEDED")) {
          throw new Error("LIMIT:주소는 최대 10개까지 저장할 수 있습니다.");
        }
        throw new Error(`SAVE_ADDRESS_FAIL:${msg}`);
      }
    }
  }

  // 주문 생성 (Toss orderId = toss_order_id = 내부 주문 UUID)
  const f = payload.form;
  const orderId = randomUUID();
  const tossOrderId = orderId;
  const orderName = buildCheckoutOrderName({
    firstItemName: items[0]!.name,
    itemCount: items.length,
  }).slice(0, 100);

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      id: orderId,
      user_id: user.id,
      status: "pending",
      total_amount: serverTotals.total,
      subtotal_amount: serverTotals.subtotal,
      shipping_fee: serverTotals.shipping,
      discount_amount: serverTotals.discount,
      currency: "KRW",
      payment_status: "requested",
      contact_name: f.contactName,
      contact_phone: f.contactPhone,
      contact_email: f.contactEmail,
      shipping_name: shippingName,
      shipping_phone: shippingPhone,
      shipping_address_line1: addressLine1,
      shipping_address_line2: addressLine2,
      shipping_city: null,
      shipping_state: null,
      shipping_zip: null,
      shipping_country: "KR",
      toss_order_id: tossOrderId,
    })
    .select("id")
    .single();

  if (orderError || !order) {
    throw new Error(`ORDER_CREATE_FAIL:${orderError?.message ?? "주문 생성 실패"}`);
  }

  // 다음 결제에서 재사용할 수 있도록 "최근 배송지"를 주소록에 best-effort로 저장/갱신
  try {
    await upsertRecentAddress({
      sb,
      userId: user.id,
      shippingName,
      shippingPhone,
      addressLine1,
      addressLine2,
      memo,
    });
  } catch {
    // 주문 자체를 실패시키지 않기 위해 무시
  }

  // 주문 아이템 생성
  const { error: itemsError } = await supabase.from("order_items").insert(
    items.map((it) => {
      const unit = it.unitSalePrice ?? it.unitPrice;
      return {
        order_id: order.id,
        product_id: it.productId,
        quantity: it.quantity,
        unit_price: it.unitPrice,
        unit_sale_price: it.unitSalePrice,
        product_name: it.name,
        product_image_url: it.imageUrl,
        line_subtotal: unit * it.quantity,
      };
    }),
  );

  if (itemsError) {
    await supabase.from("orders").delete().eq("id", order.id).eq("user_id", user.id);
    throw new Error(`ORDER_ITEMS_FAIL:${itemsError.message}`);
  }

  const { error: paymentError } = await supabase.from("payments").insert({
    order_id: order.id,
    user_id: user.id,
    provider: "toss",
    method: "card",
    amount: serverTotals.total,
    currency: "KRW",
    status: "pending",
  });
  if (paymentError) {
    await supabase.from("orders").delete().eq("id", order.id).eq("user_id", user.id);
    throw new Error(`PAYMENT_CREATE_FAIL:${paymentError.message}`);
  }

  revalidatePath("/checkout");

  return {
    orderId: order.id,
    tossOrderId,
    amount: Math.floor(normalizeMoney(serverTotals.total)),
    orderName,
  };
}

export const createOrderFromCart = findOrCreateOrder;

