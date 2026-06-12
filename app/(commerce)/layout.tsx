import { LayoutHeader } from "@/components/commerce/layout/LayoutHeader";
import { LayoutFooter } from "@/components/commerce/layout/LayoutFooter";
import { CartInitializer } from "@/components/commerce/layout/CartInitializer";
import { Toaster as HotToaster } from "react-hot-toast";
import { Toaster } from "sonner";

// 커머스 공통 레이아웃과 전역 토스트 컨테이너를 함께 제공합니다.
export default function CommerceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-(--commerce-background-default)">
      <CartInitializer />
      <LayoutHeader />
      <main className="flex-1 pt-[60px]">{children}</main>
      <LayoutFooter />
      {/* 기존 sonner와 별도로, 새 Retry/Diff UI에서 쓰는 react-hot-toast도 함께 노출합니다. */}
      <HotToaster position="top-center" />
      <Toaster richColors position="top-center" closeButton />
    </div>
  );
}
