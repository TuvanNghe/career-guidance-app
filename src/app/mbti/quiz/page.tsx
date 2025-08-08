import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabaseServer'

type Props = {
  searchParams: Promise<{ start?: string }>
}

export default async function MbtiQuizPage({ searchParams }: Props) {
  const sp = await searchParams
  if (sp.start !== '1') redirect('/mbti')

  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/signup?redirectTo=/mbti')

  // ...giữ nguyên phần còn lại
  return (
    <div />
  )
}
