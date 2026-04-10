import { LayoutHeader } from "@/components/commerce/layout/LayoutHeader";
import { LayoutFooter } from "@/components/commerce/layout/LayoutFooter";

export default function CommerceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-(--commerce-background-default)">
      <LayoutHeader />
      <main className="pt-[60px]">{children}</main>
      <LayoutFooter />
    </div>
  );
}
