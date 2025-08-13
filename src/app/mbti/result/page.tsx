/* MBTI Result – Server Component (tự lấy code từ DB nếu không có ?code=) */
export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { MBTI_MAP } from '@/lib/mbtiDescriptions'

type Props = { searchParams: Promise<{ code?: string | string[] }> }

export default async function MbtiResultPage({ searchParams }: Props) {
  const supabase = createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login?redirectedFrom=/mbti')

  // 1) Lấy code từ query (nếu có) – Next 15 cần await
  const sp = await searchParams
  let codeParam = Array.isArray(sp.code) ? sp.code[0] : sp.code
  codeParam = (codeParam ?? '').toUpperCase()

  // 2) Nếu không có query, lấy từ DB (ưu tiên career_profiles)
  let code = codeParam
  if (!/^(E|I)(S|N)(T|F)(J|P)$/.test(code)) {
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
    code = (profile?.mbti_type || lastMbti?.type || '').toUpperCase()
  }

  // 3) Không có code hợp lệ -> về /mbti
  if (!/^(E|I)(S|N)(T|F)(J|P)$/.test(code)) redirect('/mbti')

  // 4) Đồng bộ hồ sơ (idempotent)
  await supabase.from('mbti_results').upsert({ user_id: user.id, type: code })
  await supabase
    .from('career_profiles')
    .upsert(
      { user_id: user.id, mbti_type: code, updated_at: new Date().toISOString() },
      { onConflict: 'user_id' }
    )

  // 5) Render mô tả
  const desc = MBTI_MAP?.[code]

  return (
    <section className="mx-auto max-w-3xl py-14 space-y-10 text-center">
      <h1 className="text-4xl font-bold">Kết quả MBTI: {code}</h1>

      <p className="text-lg">{desc?.intro ?? 'Chưa có mô tả cho kiểu này.'}</p>

      {desc && (
        <div className="grid gap-6 md:grid-cols-3 text-left">
          <Section title="💪 Thế mạnh" items={desc.strengths} />
          <Section title="⚠️ Điểm cần lưu ý" items={desc.flaws} />
          <Section title="🔎 Gợi ý nghề" items={desc.careers} />
        </div>
      )}

      <a
        href="/profile?step=trait"
        className="inline-block rounded bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-700"
      >
        Xem Hồ sơ phát triển nghề
      </a>
    </section>
  )
}

function Section({ title, items = [] as string[] }) {
  if (!items?.length) return null
  return (
    <div>
      <h2 className="mb-2 font-semibold">{title}</h2>
      <ul className="list-disc list-inside space-y-1">
        {items.map((t) => (
          <li key={t}>{t}</li>
        ))}
      </ul>
    </div>
  )
}
