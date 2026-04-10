import { LayoutHeader } from "@/components/commerce/layout/LayoutHeader";
import { Poppins } from "next/font/google";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export default function CommerceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={`${poppins.variable} min-h-screen bg-(--commerce-background-default)`}>
      <LayoutHeader />
      <main className="pt-[60px]">{children}</main>
    </div>
  );
}
