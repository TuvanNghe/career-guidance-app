import type { ReactNode } from "react";
import "./globals.css";
import SupabaseProvider from "@/providers/SupabaseProvider";   // 👈 dùng provider mới
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata = {
  title: "Hướng nghiệp AI | CareerAI",
  description: "Nền tảng tư vấn nghề nghiệp & luyện phỏng vấn cùng AI",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="vi">
      <body className="bg-gray-50 antialiased">
        <SupabaseProvider>
          <Header />
          <main className="pt-header min-h-screen">{children}</main>
          <Footer />
        </SupabaseProvider>
      </body>
    </html>
  );
}
