import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

/* ------------------------------------------------------------ */
/*  Factory chung                                                */
/* ------------------------------------------------------------ */
function makeClient(
  url: string,
  key: string,
  allowCookieWrite = false,           // ❌ KHÔNG ghi cookie nếu = false
) {
  const store = cookies();

  return createServerClient(url, key, {
    cookies: {
      get   : (n: string) => store.get(n)?.value,
      set   : allowCookieWrite
        ? (n, v, o) => store.set({ name: n, value: v, ...o })
        : () => {},
      remove: allowCookieWrite
        ? (n, o) => store.set({ name: n, value: "", ...o })
        : () => {},
    },
  });
}

/* ------------------------------------------------------------ */
/* 1. CLIENT NGƯỜI DÙNG – anon key (kiểm tra session, RLS)       */
/* ------------------------------------------------------------ */
export function createSupabaseUserClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  if (!url || !key) throw new Error("Missing Supabase anon env vars");
  return makeClient(url, key, false);          // không ghi cookie server
}

/* ------------------------------------------------------------ */
/* 2. CLIENT ADMIN – service-role key (ghi DB, bypass RLS)       */
/*    KHÔNG ghi cookie xuống browser → tránh lỗi parse JSON      */
/* ------------------------------------------------------------ */
export function createSupabaseAdminClient() {
  const url = process.env.SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  if (!url || !key) throw new Error("Missing Supabase service-role env vars");
  return makeClient(url, key, false);          // allowCookieWrite = false
}

/* ------------------------------------------------------------ */
/* 3. READ-ONLY cho Server Component / Layout                    */
/* ------------------------------------------------------------ */
export function createSupabaseReadOnly() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  if (!url || !key) throw new Error("Missing Supabase anon env vars");
  return makeClient(url, key, true);           // readOnly → set/remove no-op
}

/* ------------------------------------------------------------ */
/* 4. ALIAS GIỮ TƯƠNG THÍCH CODE CŨ – XÓA SAU KHI REFECTOR XONG  */
/* ------------------------------------------------------------ */
export const createSupabaseRouteServerClient = createSupabaseAdminClient;
export const createSupabaseServerClient      = createSupabaseAdminClient;
export const createSupabaseRouteClient       = createSupabaseAdminClient;
