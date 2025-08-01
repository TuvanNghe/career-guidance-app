import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

function makeClient(url: string, key: string, readOnly: boolean) {
  const store = cookies();
  return createServerClient(url, key, {
    cookies: {
      get   : (n: string) => store.get(n)?.value,
      set   : readOnly ? () => {} : (n, v, o) => store.set({ name: n, value: v, ...o }),
      remove: readOnly ? () => {} : (n, o) => store.set({ name: n, value: "", ...o }),
    },
  });
}

/* 🌟 1. Client cho người dùng – anon key (session sẽ hoạt động) */
export function createSupabaseUserClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return makeClient(url, key, false);
}

/* 🌟 2. Client admin – service-role key */
export function createSupabaseAdminClient() {
  const url = process.env.SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return makeClient(url, key, false);
}

/* 🌟 3. Read-only cho Server Component */
export function createSupabaseReadOnly() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return makeClient(url, key, true);
}

/* alias cũ để không gãy code */
export const createSupabaseRouteClient        = createSupabaseAdminClient;
export const createSupabaseRouteServerClient  = createSupabaseAdminClient;
export const createSupabaseServerClient       = createSupabaseAdminClient;
