import { AdminShell } from "@/components/admin/AdminShell";
import { checkAdminAccess } from "@/lib/auth/admin";
import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
export const metadata = {
  title: "오브온 관리자",
  robots: { index: false, follow: false },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/admin");
  if (!(await checkAdminAccess())) notFound();
  return <AdminShell>{children}</AdminShell>;
}
