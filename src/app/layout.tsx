/* Root layout – server component */
import type { ReactNode } from "react";
import "./globals.css";

import Header from "../components/Header";
import Footer from "../components/Footer";

/* SEO */
export const metadata = {
  title: "Hướng nghiệp AI | CareerAI",
  description: "Nền tảng tư vấn nghề nghiệp & luyện phỏng vấn cùng AI",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="vi">
      <body className="bg-gray-50 antialiased">
        <Header />
        <main className="pt-header min-h-screen">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
