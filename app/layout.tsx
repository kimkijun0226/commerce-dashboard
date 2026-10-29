import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter, Noto_Sans_KR, Poppins } from "next/font/google";
import { ReactQueryProvider } from "@/app/_providers/ReactQueryProvider";
import { SupabaseAuthProvider } from "@/app/_providers/SupabaseAuthProvider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const notoSansKr = Noto_Sans_KR({
  variable: "--font-noto-sans-kr",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "RÊVIE 레비 | LIVE YOUR DREAM",
  icons: { icon: "/brand/revie-symbol.svg" },
  description: "상상하던 나, 꿈꾸던 공간이 일상이 되는 곳. 패션·뷰티·리빙을 하나의 취향으로 연결하는 RÊVIE(레비).",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${poppins.variable} ${inter.variable} ${notoSansKr.variable} antialiased`}
      >
        <ReactQueryProvider>
          <SupabaseAuthProvider>{children}</SupabaseAuthProvider>
        </ReactQueryProvider>
      </body>
    </html>
  );
}
