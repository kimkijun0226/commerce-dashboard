import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AddressBook } from "@/components/account/addresses/AddressBook";
import { commerceColors } from "@/commons/constants/color";
import { commerceTypography } from "@/commons/constants/typography";
import { typographyToStyle } from "@/components/ui";

type AddressRow = {
  id: string;
  label: string | null;
  recipient_name: string | null;
  recipient_phone: string | null;
  address_line1: string;
  address_line2: string | null;
  memo: string | null;
  is_default: boolean;
  created_at: string;
  updated_at: string;
};

export default async function AddressesStandalonePage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>> | Record<string, string | string[] | undefined>;
}) {
  const sp = await Promise.resolve(searchParams ?? {});
  const next = typeof sp.next === "string" ? sp.next : undefined;
  const mode = next === "/checkout" ? "pick" : next === "/account" ? "defaultOnly" : "manage";

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email) redirect(`/login?next=${encodeURIComponent("/addresses")}`);

  const { data: addresses } = await supabase
    .from("user_addresses")
    .select(
      "id,label,recipient_name,recipient_phone,address_line1,address_line2,memo,is_default,created_at,updated_at",
    )
    .eq("user_id", user.id)
    .order("is_default", { ascending: false })
    .order("updated_at", { ascending: false });

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-16 sm:px-8">
      <header className="text-center">
        <h1
          className="text-[54px] font-medium leading-[58px] tracking-[-1px]"
          style={{
            ...typographyToStyle(commerceTypography.headline3),
            color: commerceColors.text.primary,
          }}
        >
          Addresses
        </h1>
        <p
          className="mt-2"
          style={{
            ...typographyToStyle(commerceTypography.body2),
            color: commerceColors.text.secondary,
          }}
        >
          배송지를 추가/수정하고 기본 배송지를 설정할 수 있습니다.
        </p>
      </header>

      <div className="mx-auto mt-10 w-full max-w-[960px]">
        <AddressBook
          initialAddresses={(addresses ?? []) as unknown as AddressRow[]}
          nextHref={next}
          showHeader={false}
          mode={mode}
        />
      </div>
    </div>
  );
}

