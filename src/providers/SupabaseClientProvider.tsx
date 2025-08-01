"use client";

import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { SessionContextProvider } from "@supabase/auth-helpers-react";

/* ────────────────────────────────────────────────────────────── */
/* 1. Hàm xoá mọi cookie sb-... chứa JWT hỏng                    */
/* ────────────────────────────────────────────────────────────── */
function purgeInvalidSupabaseCookies() {
  document.cookie
    .split(";")
    .map((c) => c.trim())
    .forEach((kv) => {
      const [name, value] = kv.split("=");
      if (!name?.startsWith("sb-")) return;
      try {
        JSON.parse(decodeURIComponent(value)); // hợp lệ JSON ➜ giữ
      } catch {
        // ✂ xoá cookie hỏng
        document.cookie = `${name}=; Max-Age=0; Path=/; SameSite=Lax`;
      }
    });
}

/* ────────────────────────────────────────────────────────────── */
/* 2. Provider                                                   */
/* ────────────────────────────────────────────────────────────── */
export default function SupabaseClientProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [ready, setReady] = useState(false);
  const [supabase, setSupabase] = useState<any>(null);

  useEffect(() => {
    /* a) Dọn cookie hỏng TRƯỚC khi tạo client */
    purgeInvalidSupabaseCookies();

    /* b) Tạo client anon (persistSession + autoRefresh) */
    const client = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { auth: { persistSession: true, autoRefreshToken: true } },
    );

    setSupabase(client);
    setReady(true);
  }, []);

  if (!ready) return null;            // tránh render khi chưa có client

  return (
    <SessionContextProvider supabaseClient={supabase}>
      {children}
    </SessionContextProvider>
  );
}
