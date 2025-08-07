// src/lib/supabaseServer.ts
import { cookies } from 'next/headers'
import {
  createServerClient,
  createBrowserClient,
  type SupabaseClient
} from '@supabase/ssr'
import type { Database } from '@/types/supabase'

/**
 * Cho API Route Handlers / Middleware
 */
export async function createSupabaseRouteServerClient(): Promise<SupabaseClient<Database>> {
  // phải await cookies() theo Next.js 15
  const cookieStore = await cookies()  
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (toSet) => {
          toSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options)
          })
        }
      }
    }
  )
}

/**
 * Cho Server Components / Server Actions
 */
export async function createSupabaseServerClient(): Promise<SupabaseClient<Database>> {
  const cookieStore = await cookies()
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (toSet) => {
          toSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options)
          })
        }
      }
    }
  )
}

/**
 * Tuỳ chọn: cho Client Components ("use client")
 */
export function createSupabaseBrowserClient(): SupabaseClient<Database> {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
