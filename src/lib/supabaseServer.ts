// src/lib/supabaseServer.ts
import { cookies } from 'next/headers'
import { createServerClient, type CookieOptions } from '@supabase/ssr'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

function assertEnv() {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error(
      'Your project\'s URL and Key are required to create a Supabase client!\n' +
      'Check your Supabase project\'s API settings and set NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY.'
    )
  }
}

/**
 * Server Component / Page (không được set/remove cookie)
 * - Fix lỗi: "Cookies can only be modified in a Server Action or Route Handler"
 */
export async function createSupabaseServerClient() {
  assertEnv()
  const cookieStore = await cookies()

  return createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value
      },
      // Trong Server Component KHÔNG được sửa cookie → no-op
      set() {},
      remove() {},
    },
  })
}

/**
 * Route Handler / Server Action (được phép set/remove cookie)
 * - Fix lỗi: `cookies()` must be awaited + cho phép set/remove
 */
export async function createSupabaseRouteServerClient() {
  assertEnv()
  const cookieStore = await cookies()

  return createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value
      },
      set(name: string, value: string, options: CookieOptions) {
        cookieStore.set(name, value, options as any)
      },
      remove(name: string, options: CookieOptions) {
        cookieStore.set(name, '', { ...(options as any), maxAge: 0 })
      },
    },
  })
}

/** Giữ tương thích ngược với các file đang import nhầm tên */
export const createSupabaseRouteClient = createSupabaseRouteServerClient
export const createSupabaseServer = createSupabaseServerClient
