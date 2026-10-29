import { AdminShell } from "@/components/admin/AdminShell";
import { checkAdminAccess, getAdminUser } from "@/lib/auth/admin";
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
  const user = await getAdminUser();
  if (!user) redirect("/login?next=/admin");
  if (!(await checkAdminAccess())) notFound();
  return <AdminShell>{children}</AdminShell>;
}
