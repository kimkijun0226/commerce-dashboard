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
  title: "오브온 | 취향이 켜지는 순간",
  icons: { icon: "/brand/oveon-symbol.svg" },
  description: "옷, 뷰티, 홈. 나의 취향으로 일상을 켜는 라이프스타일 셀렉트숍 오브온.",
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
