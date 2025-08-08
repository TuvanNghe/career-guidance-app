// src/app/blog/layout.tsx
import { Suspense } from "react";

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  // Server Component - chỉ bọc Suspense, KHÔNG đổi logic page
  return <Suspense fallback={null}>{children}</Suspense>;
}
