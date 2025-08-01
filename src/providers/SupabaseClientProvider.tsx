"use client";

import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { SessionContextProvider } from "@supabase/auth-helpers-react";

/** Xoá mọi cookie `sb-*-auth-token / refresh-token` không phải JSON */
function purgeInvalidSupabaseCookies() {
  document.cookie
    .split(";")
    .map((c) => c.trim())
    .forEach((kv) => {
      const [name, value] = kv.split("=");
      if (!name?.startsWith("sb-")) return;
      try {
        JSON.parse(decodeURIComponent(value));
      } catch {
        // ❌ giá trị không phải JSON → xoá
        document.cookie = `${name}=; Max-Age=0; Path=/; SameSite=Lax`;
      }
    });
}

export default function SupabaseClientProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  /* 1️⃣ Chạy 1 lần ở browser: xoá cookie hỏng trước khi init client */
  useEffect(() => purgeInvalidSupabaseCookies(), []);

  /* 2️⃣ Khởi tạo client anon – persist + auto refresh */
  const [supabase] = useState(() =>
    createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { auth: { persistSession: true, autoRefreshToken: true } },
    ),
  );

  return (
    <SessionContextProvider supabaseClient={supabase}>
      {children}
    </SessionContextProvider>
  );
}
