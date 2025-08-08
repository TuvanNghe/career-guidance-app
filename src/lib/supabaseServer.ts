// Tạo client cho Server Component & cho Route Handler theo chuẩn Next 15
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

const SUPABASE_URL = process.env.SUPABASE_URL!
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY!

/**
 * Dùng trong Server Components / Pages (chỉ ĐỌC cookie)
 * -> KHÔNG gọi set/remove cookie ở đây để tránh lỗi "Cookies can only be modified..."
 */
export async function createSupabaseServerClient() {
  const cookieStore = await cookies()
  return createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value
      },
      // Server Component không được phép ghi cookie
      set() {},
      remove() {},
    },
  })
}

/**
 * Dùng trong Route Handlers / Server Actions (được PHÉP ghi cookie)
 */
export async function createSupabaseRouteServerClient() {
  const cookieStore = await cookies()
  return createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value
      },
      set(name: string, value: string, options: CookieOptions) {
        cookieStore.set(name, value, options)
      },
      remove(name: string, options: CookieOptions) {
        cookieStore.set(name, '', { ...options, maxAge: 0 })
      },
    },
  })
}
