/* ------------------------------------------------------------------
   /api/career/focus – lưu mục tiêu (WHAT / WHY / HOW) vào career_goal
 * -----------------------------------------------------------------*/
import { NextResponse } from 'next/server'
import { createSupabaseRouteServerClient } from '@/lib/supabaseServer'

export const dynamic = 'force-dynamic'
export const runtime  = 'nodejs'

export async function POST (req: Request) {
  const supabase = await createSupabaseRouteServerClient()

  /* 1. Auth */
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'AUTH' }, { status: 401 })

  /* 2. Payload */
  const body = await req.json()
  const {
    job, goals, activities,
    start_date, end_date,
    supporters,
  } = body

  /* 3. Upsert vào career_goal */
  const { error } = await supabase
    .from('career_goal')
    .upsert(
      {
        user_id    : user.id,
        job,
        goals,
        activities,
        start_date : start_date || null,
        end_date   : end_date   || null,
        supporters,
        updated_at : new Date().toISOString(),
      },
      { onConflict: 'user_id' }        // mỗi user 1 hàng
    )

  if (error) {
    console.error(error)
    return NextResponse.json({ error: 'DB_UPDATE' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
