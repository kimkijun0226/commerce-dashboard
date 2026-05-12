"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type AddressInput = {
  label?: string;
  addressLine1: string;
  addressLine2?: string;
  isDefault?: boolean;
};

function normalize(input: AddressInput) {
  const label = input.label?.trim() || null;
  const addressLine1 = input.addressLine1.trim();
  const addressLine2 = input.addressLine2?.trim() || null;
  const isDefault = Boolean(input.isDefault);

  if (!addressLine1) throw new Error("VALIDATION:주소를 입력해 주세요.");

  return { label, addressLine1, addressLine2, isDefault };
}

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) throw new Error("AUTH_REQUIRED:로그인이 필요합니다.");
  return { supabase, user };
}

export async function createAddress(input: AddressInput) {
  const { supabase, user } = await requireUser();
  const v = normalize(input);
  const sb = supabase as unknown as {
    from: (table: string) => any;
  };

  // friendly limit check (DB에서도 트리거로 보장)
  const { count } = await sb
    .from("user_addresses")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id);
  if ((count ?? 0) >= 10) {
    throw new Error("LIMIT:주소는 최대 10개까지 저장할 수 있습니다.");
  }

  if (v.isDefault) {
    await sb.from("user_addresses").update({ is_default: false }).eq("user_id", user.id);
  }

  const { data, error } = await sb
    .from("user_addresses")
    .insert({
    user_id: user.id,
    label: v.label,
    address_line1: v.addressLine1,
    address_line2: v.addressLine2,
    is_default: v.isDefault,
    })
    .select("id")
    .single();

  if (error) {
    const msg = error.message ?? "주소 저장에 실패했습니다.";
    if (msg.includes("USER_ADDRESSES_LIMIT_EXCEEDED")) {
      throw new Error("LIMIT:주소는 최대 10개까지 저장할 수 있습니다.");
    }
    throw new Error(`SAVE_FAIL:${msg}`);
  }

  revalidatePath("/account/addresses");
  revalidatePath("/checkout");

  return { id: String(data?.id ?? "") };
}

export async function updateAddress(addressId: string, input: AddressInput) {
  const { supabase, user } = await requireUser();
  const v = normalize(input);
  const sb = supabase as unknown as { from: (table: string) => any };

  if (v.isDefault) {
    await sb.from("user_addresses").update({ is_default: false }).eq("user_id", user.id);
  }

  const { error } = await sb
    .from("user_addresses")
    .update({
      label: v.label,
      address_line1: v.addressLine1,
      address_line2: v.addressLine2,
      is_default: v.isDefault,
    })
    .eq("id", addressId)
    .eq("user_id", user.id);

  if (error) throw new Error(`UPDATE_FAIL:${error.message}`);

  revalidatePath("/account/addresses");
  revalidatePath("/checkout");
}

export async function deleteAddress(addressId: string) {
  const { supabase, user } = await requireUser();
  const sb = supabase as unknown as { from: (table: string) => any };
  const { error } = await sb
    .from("user_addresses")
    .delete()
    .eq("id", addressId)
    .eq("user_id", user.id);
  if (error) throw new Error(`DELETE_FAIL:${error.message}`);

  revalidatePath("/account/addresses");
  revalidatePath("/account");
  revalidatePath("/checkout");
}

export async function setDefaultAddress(addressId: string) {
  const { supabase, user } = await requireUser();
  const sb = supabase as unknown as { from: (table: string) => any };

  await sb.from("user_addresses").update({ is_default: false }).eq("user_id", user.id);
  const { error } = await sb
    .from("user_addresses")
    .update({ is_default: true })
    .eq("id", addressId)
    .eq("user_id", user.id);

  if (error) throw new Error(`DEFAULT_FAIL:${error.message}`);

  revalidatePath("/account/addresses");
  revalidatePath("/account");
  revalidatePath("/checkout");
}

