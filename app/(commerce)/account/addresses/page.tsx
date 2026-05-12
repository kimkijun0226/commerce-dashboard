import { redirect } from "next/navigation";

export default async function AddressesPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>> | Record<string, string | string[] | undefined>;
}) {
  const sp = await Promise.resolve(searchParams ?? {});
  const next = typeof sp.next === "string" ? sp.next : undefined;
  const qs = new URLSearchParams();
  if (next) qs.set("next", next);
  redirect(`/addresses${qs.toString() ? `?${qs.toString()}` : ""}`);
}

