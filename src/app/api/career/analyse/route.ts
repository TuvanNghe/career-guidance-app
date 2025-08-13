/* ------------------------------------------------------------------------- *
   /api/career/analyse – Phân tích Knowdell + gợi ý nghề + lưu Supabase
 * ------------------------------------------------------------------------- */
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

import { analyseKnowdell }                 from '@/lib/career/analyseKnowdell'
import { suggestJobs }                     from '@/lib/career/matchJobs'
import { createSupabaseRouteServerClient } from '@/lib/supabaseServer'

// ❗️CHỈ KHAI BÁO 1 LẦN
export const dynamic = 'force-dynamic'  // Edge hay Node tuỳ Vercel
export const runtime  = 'nodejs'        // cần SERVICE_ROLE key cho DB-write

export async function POST() {
  try {
    /* ------------------------------------------------------------------- *
     * 1) Khởi tạo Supabase client an toàn (unwrap helper + fallback)
     * ------------------------------------------------------------------- */
    const _ret = await createSupabaseRouteServerClient()

    let supabase: any =
      _ret && typeof _ret === 'object'
        ? (('from' in _ret || 'auth' in _ret) ? _ret
           : ('supabase' in _ret)             ? (_ret as any).supabase
           : ('client'   in _ret)             ? (_ret as any).client
                                              : null)
        : null

    if (!supabase || typeof supabase?.auth?.getUser !== 'function') {
      const cookieStore = cookies()
      supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            get: (name) => cookieStore.get(name)?.value,
            set: (name, value, options) =>
              cookieStore.set({ name, value, ...options }),
            remove: (name, options) =>
              cookieStore.set({ name, value: '', ...options, maxAge: 0 }),
          },
        }
      )
    }

    if (!supabase) {
      return NextResponse.json({ error: 'SUPABASE_CLIENT' }, { status: 500 })
    }

    /* ------------------------------------------------------------------- *
     * 2) Lấy user từ cookie
     * ------------------------------------------------------------------- */
    const {
      data: { user },
      error: userErr,
    } = await supabase.auth.getUser()

    if (userErr || !user) {
      return NextResponse.json({ error: 'AUTH' }, { status: 401 })
    }
    const uid = user.id

    /* ------------------------------------------------------------------- *
     * 3) (GIỮ LOGIC CŨ) Đọc dữ liệu cần thiết cho phân tích
     * ------------------------------------------------------------------- */
    const { data: profile, error: getErr } = await supabase
      .from('career_profiles')
      .select('*')
      .eq('user_id', uid)
      .maybeSingle()

    if (getErr) {
      console.error(getErr)
      return NextResponse.json({ error: 'DB_GET' }, { status: 500 })
    }

    /* ------------------------------------------------------------------- *
     * 4) (GIỮ LOGIC CŨ) Chạy phân tích Knowdell + gợi ý nghề
     *    — giữ nguyên chữ ký hàm của dự án bạn (nếu khác, sửa lại đúng chữ ký)
     * ------------------------------------------------------------------- */
    const summaryMD = await (analyseKnowdell as any)(supabase, uid, profile)
    const jobs      = await (suggestJobs as any)(supabase, uid, summaryMD, profile)

    /* ------------------------------------------------------------------- *
     * 5) (GIỮ LOGIC CŨ) Lưu kết quả vào DB
     * ------------------------------------------------------------------- */
    const { error: upErr } = await supabase
      .from('career_profiles')
      .update({
        knowdell_summary: summaryMD,
        suggested_jobs  : jobs, // jsonb[]
        updated_at      : new Date().toISOString(),
      })
      .eq('user_id', uid)

    if (upErr) {
      console.error(upErr)
      return NextResponse.json({ error: 'DB_UPDATE' }, { status: 500 })
    }

    /* ------------------------------------------------------------------- *
     * 6) Trả kết quả
     * ------------------------------------------------------------------- */
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    console.error('analyse error:', e)
    return NextResponse.json(
      { error: e?.message || 'INTERNAL' },
      { status: 500 }
    )
  }
}
