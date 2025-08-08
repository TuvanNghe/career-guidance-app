/* ----------------------- GET career_goal ---------------------- */
import { NextResponse } from 'next/server'
import { createSupabaseRouteServerClient } from '@/lib/supabaseServer'

export const dynamic = 'force-dynamic'

export async function GET () {
  const supabase = await createSupabaseRouteServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'AUTH' }, { status: 401 })

  const { data } = await supabase
    .from('career_goal')
    .select(`
      job, goals, activities,
      start_date, end_date, supporters
    `)
    .eq('user_id', user.id)
    .limit(1)
    .maybeSingle()

  return NextResponse.json({ data })
}
