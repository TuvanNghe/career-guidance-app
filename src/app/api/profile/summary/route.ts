import { NextResponse } from 'next/server'
import { createSupabaseRouteServerClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = createSupabaseRouteServerClient()

  // 1) Auth
  const {
    data: { user },
    error: userErr,
  } = await supabase.auth.getUser()
  if (userErr || !user) {
    return NextResponse.json({ error: 'AUTH' }, { status: 401 })
  }

  // 2) Lấy dữ liệu đúng "shape cũ" FE đang expect
  const { data, error } = await supabase
    .from('career_profiles') // đổi tên bảng/cột nếu DB của bạn khác
    .select('knowdell_summary, suggested_jobs')
    .eq('user_id', user.id)
    .maybeSingle()

  if (error) {
    console.error('[summary] DB error:', error)
    return NextResponse.json({ error: 'DB' }, { status: 500 })
  }

  return NextResponse.json({
    knowdell_summary: data?.knowdell_summary ?? '',
    suggested_jobs: data?.suggested_jobs ?? [],
  })
}
