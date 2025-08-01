"use client";

import { useEffect, useState, ReactNode } from "react";
import { SessionContextProvider } from "@supabase/auth-helpers-react";
import { createBrowserClient } from "@supabase/ssr";

/* 1. XÓA cookie Supabase hỏng (giá trị không phải JSON) – chạy trước khi tạo client */
function purgeBadCookies() {
  document.cookie.split(";").forEach(c => {
    const [name, raw] = c.trim().split("=");
    if (!name?.startsWith("sb-")) return;
    try { JSON.parse(decodeURIComponent(raw)); }
    catch { document.cookie = `${name}=; Path=/; Max-Age=0; SameSite=Lax`; }
  });
}

export default function SupabaseProvider({ children }: { children: ReactNode }) {
  const [client, setClient] = useState<any>();

  useEffect(() => {
    purgeBadCookies();                                         // ✅ xoá cookie hỏng
    setClient(
      createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        { auth: { persistSession: true, autoRefreshToken: true } }
      )
    );
  }, []);

  if (!client) return null;           // chờ tới khi client khởi tạo xong

  return (
    <SessionContextProvider supabaseClient={client}>
      {children}
    </SessionContextProvider>
  );
}
