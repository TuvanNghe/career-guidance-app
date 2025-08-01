import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

function makeClient(url: string, key: string,   /**/
                    allowCookieWrite = false) { // 🔸 <— flag
  const store = cookies();
  return createServerClient(url, key, {
    cookies: {
      get   : (n: string) => store.get(n)?.value,
      set   : allowCookieWrite ? (n, v, o) => store.set({ name: n, value: v, ...o }) : () => {},
      remove: allowCookieWrite ? (n, o) => store.set({ name: n, value: "", ...o })    : () => {},
    },
  });
}

/* 1. Client người dùng – anon key (đọc & ghi localStorage, không ghi cookie server) */
export function createSupabaseUserClient() {
  return makeClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    false,           // ⬅️ không ghi cookie
  );
}

/* 2. Client admin – service-role key (ghi DB, KHÔNG ghi cookie!) */
export function createSupabaseAdminClient() {
  return makeClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    false,           // ⬅️ quan trọng: không ghi cookie
  );
}

/* 3. Read-only cho Server Component */
export function createSupabaseReadOnly() {
  return makeClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    false,
  );
}

/* alias giữ tương thích cũ */
export const createSupabaseRouteClient = createSupabaseAdminClient;
