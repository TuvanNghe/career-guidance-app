/* Root layout – server component */
import type { ReactNode } from "react";
import "./globals.css";

import Header from "../components/Header";
import Footer from "../components/Footer";
import SupabaseClientProvider from "@/providers/SupabaseClientProvider";  // ✨

export const metadata = {
  title: "Hướng nghiệp AI | CareerAI",
  description: "Nền tảng tư vấn nghề nghiệp & luyện phỏng vấn cùng AI",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="vi">
      <body className="min-h-screen flex flex-col bg-gray-50 antialiased">
        <SupabaseClientProvider>
          <Header />

          <main className="flex-1 pt-header">{children}</main>

          <Footer />
        </SupabaseClientProvider>
      </body>
    </html>
  );
}
