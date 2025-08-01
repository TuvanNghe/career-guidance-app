"use client";
import { useState, useEffect } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { SessionContextProvider } from "@supabase/auth-helpers-react";

export default function SupabaseClientProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  /* 🔸 1. Dọn cookie hỏng */
  useEffect(() => {
    const project = process.env.NEXT_PUBLIC_SUPABASE_URL!.split("https://")[1]?.split(".")[0];
    if (!project) return;
    ["auth-token", "refresh-token"].forEach((key) => {
      document.cookie = `sb-${project}-${key}=; Max-Age=0; Path=/;`;
    });
  }, []);

  /* 🔸 2. Khởi tạo client anon */
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
