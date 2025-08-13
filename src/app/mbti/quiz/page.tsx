/* MBTI Quiz – Server Component */
export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import MbtiClient from './MbtiClient'

// Next 15: searchParams là Promise -> cần await
type Props = { searchParams: Promise<{ start?: string | string[] }> }

export default async function MbtiQuizPage({ searchParams }: Props) {
  /* 0 – buộc có ?start=1 (chặn F5/đi tắt) */
  const sp = await searchParams
  const start = Array.isArray(sp.start) ? sp.start[0] : sp.start
  if (start !== '1') redirect('/mbti')

  /* 1 – Auth */
  const supabase = createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login?redirectedFrom=/mbti')

  /* 2 – nếu đã làm rồi thì về Intro (hoặc Result) */
  const { data: done } = await supabase
    .from('mbti_results')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle()
  if (done) redirect('/mbti')

  /* 3 – render client quiz */
  return <MbtiClient />
}
