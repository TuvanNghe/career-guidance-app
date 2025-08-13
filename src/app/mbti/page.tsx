/* MBTI – Intro page (Server Component) */
export const dynamic = 'force-dynamic'

import { createSupabaseServerClient } from '@/lib/supabase/server'
import MbtiLanding from './MbtiLanding'
import MbtiIntro from './MbtiIntro'

export default async function MbtiPage() {
  const supabase = createSupabaseServerClient()

  // 1) Auth
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // 2) Chưa login -> Landing
  if (!user) return <MbtiLanding />

  // 3) Đã login -> tìm kết quả (ưu tiên profile, fallback bảng kết quả)
  const [{ data: profile }, { data: lastMbti }] = await Promise.all([
    supabase
      .from('career_profiles')
      .select('mbti_type')
      .eq('user_id', user.id)
      .maybeSingle(),
    supabase
      .from('mbti_results')
      .select('type')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
  ])

  const code = (profile?.mbti_type || lastMbti?.type || '').toUpperCase()
  const hasResult = /^(E|I)(S|N)(T|F)(J|P)$/.test(code)

  // 4) Chỉ hiển thị Intro; KHÔNG render 2 nút phụ bên dưới nữa
  return (
    <main className="p-6">
      <MbtiIntro hasResult={hasResult} />
    </main>
  )
}
