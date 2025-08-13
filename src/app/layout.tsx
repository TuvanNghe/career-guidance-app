/* ------------------------------------------------------------------
   Root layout – App Router (server component)
-------------------------------------------------------------------*/
import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import './globals.css'

import Header from '@/components/Header'
import Footer from '@/components/Footer'

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
        {/* Fixed-top header (client component) */}
        <Header />

        {/* Main content – phím header cao 64 px → pt-16 */}
        <main className="pt-16 min-h-screen">{children}</main>

        {/* Footer */}
        <Footer />
      </body>
    </html>
  )
}

