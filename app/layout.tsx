import type { Metadata } from "next";
import { Noto_Sans_KR } from "next/font/google";
import { Suspense } from "react";
import "./globals.css";

const notoSansKr = Noto_Sans_KR({
  subsets: ["latin"],
  weight: ["100", "300", "400", "500", "700", "900"],
  variable: "--font-noto-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "SH 매입임대 - 매물 검색",
  description: "서울주택도시공사(SH) 매입임대주택 매물을 지도에서 쉽게 찾아보세요.",
  keywords: ["SH", "매입임대", "임대주택", "서울주택도시공사", "공공임대", "부동산"],
  openGraph: {
    title: "SH 매입임대 - 매물 검색",
    description: "서울주택도시공사(SH) 매입임대주택 매물을 지도에서 쉽게 찾아보세요.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body
        className={`${notoSansKr.variable} antialiased font-sans bg-background text-foreground`}
      >
        <Suspense fallback={
          <div className="h-screen flex items-center justify-center bg-background">
            <div className="text-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto mb-4" />
              <p className="text-gray-500 font-medium">매물 정보를 불러오는 중...</p>
            </div>
          </div>
        }>
          {children}
        </Suspense>
      </body>
    </html>
  );
}
