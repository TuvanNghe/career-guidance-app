/* ------------------------------------------------------------------
   Root layout – App Router (server component)
-------------------------------------------------------------------*/
import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import './globals.css'

import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { Suspense } from 'react' // 👈 thêm

/* SEO / Open-Graph -------------------------------------------------- */
export const metadata: Metadata = {
  title      : 'Hướng nghiệp AI | CareerAI',
  description: 'Nền tảng tư vấn nghề nghiệp & luyện phỏng vấn cùng AI',
}

export default function RootLayout ({ children }: { children: ReactNode }) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <head />
      <body className="bg-gray-50 antialiased">
        {/* Bọc TẤT CẢ nội dung bởi Suspense để hợp lệ useSearchParams/usePathname ở Header/Footer */}
        <Suspense fallback={null}>
          {/* Fixed-top header (client component) */}
          <Header />

          {/* Main content – phím header cao 64 px → pt-16 */}
          <main className="pt-16 min-h-screen">{children}</main>

          {/* Footer */}
          <Footer />
        </Suspense>
      </body>
    </html>
  )
}
