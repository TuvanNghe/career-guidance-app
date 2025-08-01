// src/app/chat/layout.tsx
export const dynamic = "force-dynamic";   // giữ dòng này

import type { ReactNode } from "react";

export default function ChatLayout({ children }: { children: ReactNode }) {
  /* chỉ return children – Provider đã ở Root */
  return children;
}
