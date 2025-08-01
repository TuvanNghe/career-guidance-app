import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

/* -------------------------------------------------------------
 * 1. Hàm factory chung
 * ------------------------------------------------------------*/
function makeClient(url: string, key: string, readOnly: boolean) {
  const store = cookies();

  return createServerClient(url, key, {
    cookies: {
      get   : (n: string) => store.get(n)?.value,
      /* ghi/xoá cookie chỉ khi NOT readOnly */
      set   : readOnly ? () => {} : (n, v, o) => store.set({ name: n, value: v, ...o }),
      remove: readOnly ? () => {} : (n, o) => store.set({ name: n, value: "", ...o }),
    },
  });
}

/* -------------------------------------------------------------
 * 2. Helpers
 * ------------------------------------------------------------*/

/* a. Read-write  ➜  dùng trong Route-handler / Server-action */
export function createSupabaseRouteClient() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Missing Supabase env vars");
  return makeClient(url, key, false);
}

/* b. Read-only  ➜  dùng trong Server Component / Layout */
export function createSupabaseReadOnly() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Missing Supabase env vars");
  return makeClient(url, key, true);
}

/* -------------------------------------------------------------
 * 3. Backward-compat aliases  (giữ tên cũ để code cũ không lỗi)
 * ------------------------------------------------------------*/
export const createSupabaseServerClient       = createSupabaseRouteClient;
export const createSupabaseRouteServerClient  = createSupabaseRouteClient;
