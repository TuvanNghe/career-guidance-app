import { cookies } from 'next/headers'
import {
  createServerComponentClient,
  createRouteHandlerClient,
} from '@supabase/auth-helpers-nextjs'
import { createClient as createSupabaseJsClient } from '@supabase/supabase-js'
// 👉 Nếu bạn có types đã generate, giữ đúng path dưới đây.
//    Không có types thì tạm bỏ <Database> ở các hàm cho đỡ lỗi TS.
import type { Database } from '@/types/database' // chỉnh path cho đúng dự án của bạn

/** Dùng trong Server Components (app/*) */
export function createSupabaseServerClient() {
  // KHÔNG gọi cookies() ở đây; helper cần "cookies" function, cứ truyền thẳng { cookies }
  return createServerComponentClient<Database>({ cookies })
}

/** Dùng trong Route Handlers (app/api/.../route.ts) & Server Actions */
export function createSupabaseRouteServerClient() {
  // Tương tự: không gọi cookies(), chỉ truyền function
  return createRouteHandlerClient<Database>({ cookies })
}

/** Dùng trong Client Components (nếu cần) */
export function createSupabaseBrowserClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  return createSupabaseJsClient<Database>(url, anon)
}