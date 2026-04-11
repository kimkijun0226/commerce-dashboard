import { LayoutHeader } from "@/components/commerce/layout/LayoutHeader";
import { LayoutFooter } from "@/components/commerce/layout/LayoutFooter";
import { Toaster } from "sonner";

export default function CommerceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-(--commerce-background-default)">
      <LayoutHeader />
      <main className="flex-1 pt-[60px]">{children}</main>
      <LayoutFooter />
      <Toaster richColors position="top-center" closeButton />
    </div>
  );
}
