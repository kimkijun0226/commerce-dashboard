import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CheckoutForm } from "@/components/commerce/CheckoutForm";
import { computeTotals, normalizeMoney, type LineItem } from "@/lib/commerce/pricing";
import { commerceColors } from "@/commons/constants/color";
import { commerceTypography } from "@/commons/constants/typography";
import { typographyToStyle } from "@/components/ui";
import type { UserAddress } from "@/components/commerce/AddressDropdown";
import { CheckoutProgress } from "@/components/commerce/CheckoutProgress";
import { tossCustomerKeyForUser } from "@/commons/utils/order";
import { CheckoutCartSyncer } from "@/components/commerce/checkout/CheckoutCartSyncer";

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

type AddressRow = {
  id: string;
  label: string | null;
  recipient_name: string;
  recipient_phone: string;
  address_line1: string;
  address_line2: string | null;
  memo: string | null;
  is_default: boolean;
};

type LastOrderRow = {
  contact_name: string | null;
  contact_phone: string | null;
  contact_email: string | null;
};

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>> | Record<string, string | string[] | undefined>;
}) {
  const sp = await Promise.resolve(searchParams ?? {});
  const selectedAddressIdParam = typeof sp.addressId === "string" ? sp.addressId : undefined;
  const supabase = await createClient();
  const sb = supabase as unknown as { from: (table: string) => any };
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("users")
    .select("display_name, email, phone")
    .eq("id", user.id)
    .maybeSingle();

  const { data: lastOrder } = await supabase
    .from("orders")
    .select("contact_name, contact_phone, contact_email")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { data: addrRows } = await sb
    .from("user_addresses")
    .select(
      "id,label,recipient_name,recipient_phone,address_line1,address_line2,memo,is_default",
    )
    .eq("user_id", user.id)
    .order("is_default", { ascending: false })
    .order("updated_at", { ascending: false });

  const addresses: UserAddress[] = ((addrRows ?? []) as unknown as AddressRow[]).map(
    (r) => ({
      id: r.id,
      label: r.label,
      recipientName: r.recipient_name,
      recipientPhone: r.recipient_phone,
      addressLine1: r.address_line1,
      addressLine2: r.address_line2,
      memo: r.memo,
      isDefault: r.is_default,
    }),
  );
  const defaultAddressId = addresses.find((a) => a.isDefault)?.id ?? null;
  const recentAddressId = addresses[0]?.id ?? null;
  const initialSelectedAddressId =
    (selectedAddressIdParam && addresses.some((a) => a.id === selectedAddressIdParam)
      ? selectedAddressIdParam
      : null) ?? defaultAddressId;
  const initialSelectedAddressIdOrRecent = initialSelectedAddressId ?? recentAddressId;

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

  if (error) {
    throw new Error(error.message);
  }

  const rows = (data ?? []) as unknown as CartRow[];

  const lineItems: LineItem[] = rows
    .filter((r) => r.products && r.products.status !== "hidden")
    .map((r) => ({
      productId: r.product_id,
      name: r.products!.name,
      imageUrl: r.products!.image_url,
      quantity: Math.max(1, Math.floor(Number(r.quantity) || 1)),
      unitPrice: normalizeMoney(r.products!.price),
      unitSalePrice:
        r.products!.sale_price == null ? null : normalizeMoney(r.products!.sale_price),
    }));

  // Checkout은 "서버 장바구니(cart_items)"가 소스 오브 트루스.
  // 상품이 없으면 빈 화면 대신 장바구니로 돌려보낸다.
  if (lineItems.length === 0) {
    redirect("/cart");
  }

  const totals = computeTotals(lineItems, 0);

  const lo = (lastOrder ?? null) as unknown as LastOrderRow | null;
  const initialValues = {
    contactName: profile?.display_name ?? lo?.contact_name ?? "",
    contactPhone: lo?.contact_phone ?? profile?.phone ?? "",
    contactEmail: profile?.email ?? lo?.contact_email ?? user.email ?? "",
    paymentMethod: "toss" as const,
    agreeToTerms: false,
  };

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-20 sm:px-8">
      <header className="text-center">
        <h1
          className="text-[54px] font-medium leading-[58px] tracking-[-1px]"
          style={{
            ...typographyToStyle(commerceTypography.headline3),
            color: commerceColors.text.primary,
          }}
        >
          Checkout
        </h1>
        <p
          className="mt-3"
          style={{
            ...typographyToStyle(commerceTypography.body2),
            color: commerceColors.text.secondary,
          }}
        >
          결제 정보와 배송지를 입력해 주세요.
        </p>
      </header>
      <CheckoutProgress currentStep={2} />

      <CheckoutCartSyncer initialEmpty={lineItems.length === 0} />

      <CheckoutForm
        initialValues={initialValues}
        items={lineItems}
        totals={totals}
        addresses={addresses}
        defaultAddressId={initialSelectedAddressIdOrRecent}
        tossCustomerKey={tossCustomerKeyForUser(user.id)}
      />
    </div>
  );
}
