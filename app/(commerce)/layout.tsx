import { LayoutHeader } from "@/components/commerce/layout/LayoutHeader";

export default function CommerceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-(--commerce-background-default)">
      <LayoutHeader />
      <main className="pt-[60px]">{children}</main>
    </div>
  );
}
