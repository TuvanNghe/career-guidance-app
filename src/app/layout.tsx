import type { ReactNode } from "react";
import "./globals.css";
import SupabaseProvider from "@/providers/SupabaseProvider";  // ✨
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="vi">
      <body className="min-h-screen flex flex-col bg-gray-50 antialiased">
        <SupabaseProvider>
          <Header />
          <main className="flex-1 pt-header">{children}</main>
          <Footer />
        </SupabaseProvider>
      </body>
    </html>
  );
}
