/* ------------------------------------------------------------------------- *
   /api/career/analyse – Phân tích Knowdell + gợi ý nghề + lưu Supabase
 * ------------------------------------------------------------------------- */
import { NextResponse } from 'next/server'
import { analyseKnowdell }                   from '@/lib/career/analyseKnowdell'
import { suggestJobs }                       from '@/lib/career/matchJobs'
import { createSupabaseRouteServerClient }   from '@/lib/supabaseServer'

export const dynamic = 'force-dynamic'  // Edge hay Node tuỳ Vercel
export const runtime  = 'nodejs'        // cần SERVICE_ROLE key cho DB-write

export async function POST () {
  /* --------------------------------------------------------------------- *
   * 1. Xác thực – lấy user từ cookie
   * --------------------------------------------------------------------- */
  const supabase = await createSupabaseRouteServerClient()
  const {
    data: { user },
    error: userErr,
  } = await supabase.auth.getUser()

  if (userErr || !user) {
    return NextResponse.json({ error: 'AUTH' }, { status: 401 })
  }
  const uid = user.id

  /* --------------------------------------------------------------------- *
   * 2. Lấy (hoặc tạo) career_profile cho user hiện tại
   * --------------------------------------------------------------------- */
  const {
    data: profileRaw,
    error: profErr,
  } = await supabase
    .from('career_profiles')
    .select('*')
    .eq('user_id', uid)
    .maybeSingle()

  if (profErr) {
    console.error(profErr)
    return NextResponse.json({ error: 'DB_READ_PROFILE' }, { status: 500 })
  }

  let profile = profileRaw

  if (!profile) {
    /* ------------------------------------------------------------------- *
     * 2.1 Chưa có profile  →  truy vấn kết quả MBTI / Holland / Knowdell
     * ------------------------------------------------------------------- */
    const [
      { data: mbti,    error: mbtiErr },
      { data: holland, error: holErr },
      { data: knowdell, error: knErr },
    ] = await Promise.all([
      supabase
        .from('mbti_results')
        .select('*')
        .eq('user_id', uid)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle(),

      supabase
        .from('holland_results')
        .select('*')
        .eq('user_id', uid)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle(),

      supabase
        .from('knowdell_interests')
        .select('*')
        .eq('user_id', uid),
    ])

    if (mbtiErr || holErr || knErr) {
      console.error(mbtiErr ?? holErr ?? knErr)
      return NextResponse.json({ error: 'DB_READ_TRAITS' }, { status: 500 })
    }

    if (!mbti || !holland || !knowdell?.length) {
      return NextResponse.json(
        { error: 'INCOMPLETE_TRAITS' },
        { status: 400 }
      )
    }

    /* ------------------------------------------------------------------- *
     * 2.2 Tạo bản ghi profile đầu tiên
     * ------------------------------------------------------------------- */
    const { data: inserted, error: insErr } = await supabase
      .from('career_profiles')
      .insert({
        user_id        : uid,
        mbti_type      : mbti.type,
        holland_profile: holland.profile,            // JSONB
        knowdell       : { interests: knowdell },    // JSONB
      })
      .select('*')
      .single()

    if (insErr) {
      console.error(insErr)
      return NextResponse.json({ error: 'DB_INSERT' }, { status: 500 })
    }
    profile = inserted
  }

  /* --------------------------------------------------------------------- *
   * 3. Nếu đã có knowdell_summary + suggested_jobs thì trả cached
   * --------------------------------------------------------------------- */
  if (profile.knowdell_summary && profile.suggested_jobs?.length) {
    return NextResponse.json({ ok: true, cached: true })
  }

  /* --------------------------------------------------------------------- *
   * 4. GPT: tóm tắt Knowdell  &  gợi ý nghề
   * --------------------------------------------------------------------- */
  const [summaryMD, jobs] = await Promise.all([
    analyseKnowdell(profile),
    suggestJobs(profile),
  ])

  /* --------------------------------------------------------------------- *
   * 5. Cập nhật profile
   * --------------------------------------------------------------------- */
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

  return NextResponse.json({ ok: true })
}
