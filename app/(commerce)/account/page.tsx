import { AccountDetailsForm } from "@/components/account/AccountDetailsForm";
import { AccountSidebar } from "@/components/account/AccountSidebar/AccountSidebar";
import { getPendingReviewSlotCountForUser } from "@/app/(commerce)/account/reviews/pending-queries";
import { createClient } from "@/lib/supabase/server";
import type { UserRole } from "@/types/supabase";
import { redirect } from "next/navigation";

export default async function AccountPage({
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

  if (!user?.email) {
    redirect("/login?next=/account");
  }

  let displayName: string | null = null;
  let email = user.email ?? "";
  let phone: string | null = null;
  let role: UserRole = "user";
  let imageUrl: string | null = null;
  let addressLabel: string | null = null;
  let addressLine1: string | null = null;
  let addressLine2: string | null = null;

  const { data: profile, error: profileError } = await supabase
    .from("users")
    .select("display_name, email, role, phone, image_url")
    .eq("id", user.id)
    .single();

  if (!profileError && profile) {
    displayName = profile.display_name;
    if (profile.email) {
      email = profile.email;
    }
    phone = profile.phone ?? null;
    role = profile.role;
    imageUrl = profile.image_url ?? null;
  } else {
    displayName = null;
    email = user.email ?? email;
  }

  // 기본/선택 주소를 서버에서 먼저 가져와 초기 렌더에서 바로 보여주기
  if (selectedAddressIdParam) {
    const { data: addr } = await sb
      .from("user_addresses")
      .select("label,address_line1,address_line2")
      .eq("id", selectedAddressIdParam)
      .eq("user_id", user.id)
      .maybeSingle();
    if (addr) {
      addressLabel = addr.label ?? null;
      addressLine1 = addr.address_line1 ?? null;
      addressLine2 = addr.address_line2 ?? null;
    }
  }

  if (!addressLine1) {
    const { data: addr } = await sb
      .from("user_addresses")
      .select("label,address_line1,address_line2")
      .eq("user_id", user.id)
      .order("is_default", { ascending: false })
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (addr) {
      addressLabel = addr.label ?? null;
      addressLine1 = addr.address_line1 ?? null;
      addressLine2 = addr.address_line2 ?? null;
    }
  }

  const pendingReviewCount = await getPendingReviewSlotCountForUser();

  return (
    <div className="bg-(--commerce-background-default) pb-16 pt-6 sm:pt-10">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-[160px]">
        <h1
          className="text-[40px] font-medium leading-[48px] tracking-[-1px] text-black sm:text-[54px] sm:leading-[58px]"
          style={{ fontFamily: "var(--commerce-font-heading)" }}
        >
          My Account
        </h1>

        <div className="mt-10 flex flex-col gap-6 lg:mt-16 lg:flex-row lg:gap-2">
          <AccountSidebar
            displayName={displayName}
            email={email}
            role={role}
            imageUrl={imageUrl}
            pendingReviewCount={pendingReviewCount}
          />
          <div className="min-w-0 flex-1 lg:pl-4">
            <AccountDetailsForm
              userId={user.id}
              initialDisplayName={displayName}
              initialPhone={phone}
              initialAddressLabel={addressLabel}
              initialAddressLine1={addressLine1}
              initialAddressLine2={addressLine2}
              email={email}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
