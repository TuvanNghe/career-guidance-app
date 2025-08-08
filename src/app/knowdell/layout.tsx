// src/app/knowdell/layout.tsx
import { Suspense } from "react";

export default function KnowdellLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense
      fallback={
        <div className="flex h-[60vh] items-center justify-center text-sm text-muted-foreground">
          Đang tải…
        </div>
      }
    >
      {children}
    </Suspense>
  );
}
