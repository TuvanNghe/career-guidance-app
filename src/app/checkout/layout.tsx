// src/app/checkout/layout.tsx
import { Suspense } from "react";

export default function CheckoutLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={null /* hoặc JSX "Đang tải…" nếu bạn muốn */}>
      {children}
    </Suspense>
  );
}
