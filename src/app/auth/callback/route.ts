import { NextResponse } from 'next/server'
import { createSupabaseRouteServerClient } from '@/lib/supabase/server'

export async function GET(req: Request) {
  const url = new URL(req.url)
  const code = url.searchParams.get('code')
  const redirectedFrom = url.searchParams.get('redirectedFrom') || '/'

  if (code) {
    const supabase = await createSupabaseRouteServerClient()
    try {
      // Lưu session vào cookie server-side
      await supabase.auth.exchangeCodeForSession(code)
    } catch {
      // bỏ qua nếu đã có session
    }
  }

  // luôn rời khỏi trang callback
  return NextResponse.redirect(new URL(redirectedFrom, req.url))
}
