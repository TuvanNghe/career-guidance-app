// src/lib/supabaseServer.ts
import { cookies } from 'next/headers'
import {
  createRouteHandlerClient,
  createServerComponentClient,
  type SupabaseClient,
} from '@supabase/auth-helpers-nextjs'

/** Cho API Route (app/api/*) */
export async function createSupabaseRouteServerClient<
  Database = any
>(): Promise<SupabaseClient<Database>> {
  const cookieStore = await cookies()
  return createRouteHandlerClient<Database>({ cookies: () => cookieStore })
}

/** Cho Server Components / React Server Actions */
export async function createSupabaseServerClient<
  Database = any
>(): Promise<SupabaseClient<Database>> {
  const cookieStore = await cookies()
  return createServerComponentClient<Database>({ cookies: () => cookieStore })
}
