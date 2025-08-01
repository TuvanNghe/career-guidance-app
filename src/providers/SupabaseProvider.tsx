"use client";
import { ReactNode, useEffect, useState } from "react";
import { SessionContextProvider } from "@supabase/auth-helpers-react";
import { createSupabaseBrowserClient } from "@/lib/supabaseBrowser";

/* xoá mọi sb-… cookie hỏng trước khi tạo client */
function purgeInvalidCookies() {
  document.cookie.split(";").forEach(c => {
    const [name, raw] = c.trim().split("=");
    if (!name?.startsWith("sb-")) return;
    try { JSON.parse(decodeURIComponent(raw)); }
    catch { document.cookie = `${name}=; Path=/; Max-Age=0; SameSite=Lax`; }
  });
}

export default function SupabaseProvider({ children }: { children: ReactNode }) {
  const [client, setClient] = useState<any | null>(null);

  useEffect(() => {
    purgeInvalidCookies();
    setClient(createSupabaseBrowserClient());
  }, []);

  if (!client) return null;             // tránh flash trắng

  return <SessionContextProvider supabaseClient={client}>{children}</SessionContextProvider>;
}
