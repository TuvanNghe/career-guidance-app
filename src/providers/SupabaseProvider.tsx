// src/providers/SupabaseProvider.tsx
"use client";

import { ReactNode, useEffect, useState } from "react";
import { SessionContextProvider } from "@supabase/auth-helpers-react";
import { createBrowserClient } from "@supabase/ssr";

function purgeBadCookies() {
  document.cookie.split(";").forEach((c) => {
    const [name, raw] = c.trim().split("=");
    if (!name?.startsWith("sb-")) return;
    try { JSON.parse(decodeURIComponent(raw)); }          // hợp lệ
    catch { document.cookie = `${name}=;Max-Age=0;Path=/`; } // xoá
  });
}

export default function SupabaseProvider({ children }: { children: ReactNode }) {
  const [client, setClient] = useState<any | null>(null);

  /* chỉ chạy ở BROWSER */
  useEffect(() => {
    purgeBadCookies();
    setClient(
      createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        { auth: { persistSession: true, autoRefreshToken: true } },
      ),
    );
  }, []);

  if (!client) return null;           // 👈  SSR không tạo client, tránh lỗi

  return (
    <SessionContextProvider supabaseClient={client}>
      {children}
    </SessionContextProvider>
  );
}
