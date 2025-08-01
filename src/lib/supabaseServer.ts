/* -------------------  Unified server-side helpers  ------------------- */
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

/** create server client with cookie store (optionally read-only) */
function makeClient(readOnly = false) {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    readOnly
      ? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      : process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        get: n => cookies().get(n)?.value,
        set: readOnly ? () => undefined : (n, v, o) => cookies().set({ name: n, value: v, ...o }),
        remove: readOnly ? () => undefined : n => cookies().set({ name: n, value: "", path: "/", maxAge: 0 }),
      },
    }
  );
}

/* 1. client dành cho người dùng -- **anon key** (có session/RLS) */
export function createSupabaseUserClient() {
  return makeClient(true);
}

/* 2. client admin -- **service-role** (ghi DB / bypass RLS) */
export function createSupabaseAdminClient() {
  return makeClient(false);
}

/* ---------- Back-compat aliases cho code cũ ---------- */
export const createSupabaseServerClient = createSupabaseUserClient;
export const createSupabaseRouteServerClient = createSupabaseUserClient;
