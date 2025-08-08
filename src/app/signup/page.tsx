'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

function sanitizeRedirect(raw?: string | null) {
  let next = (raw && decodeURIComponent(raw)) || '/'
  try {
    // Chỉ cho phép path nội bộ, bỏ domain/external
    const u = new URL(next, 'https://dummy.local')
    // Gỡ bỏ bất cứ `redirectTo` lồng bên trong để tránh vòng lặp
    u.searchParams.delete('redirectTo')
    next = u.pathname + (u.searchParams.toString() ? `?${u.searchParams.toString()}` : '')
    if (!next.startsWith('/')) next = '/'
  } catch {
    next = '/'
  }
  return next
}

export default function SignUpPage() {
  const router = useRouter()
  const params = useSearchParams()

  // Giá trị "đích" chỉ tính 1 lần và đã sanitize
  const next = useMemo(() => sanitizeRedirect(params.get('redirectTo')), [params])

  const supabase = useMemo(() => createClient(url, anon), [])
  const [loading, setLoading] = useState(true)

  // 1) Nếu OAuth trả về `code` ở URL này → đổi code sang session rồi chuyển về `next`
  useEffect(() => {
    const code = params.get('code')
    const error = params.get('error')

    // Nếu có lỗi từ provider → cứ đưa về next cho đỡ kẹt trang
    if (error) {
      router.replace(next)
      return
    }

    let unsub: (() => void) | null = null

    ;(async () => {
      try {
        // Nếu có mã code ở URL → đổi sang session
        if (code) {
          await supabase.auth.exchangeCodeForSession(window.location.href)
          // Sau khi set cookie xong, replace về `next`
          router.replace(next)
          return
        }

        // Nếu không có code: kiểm tra đã đăng nhập chưa
        const { data } = await supabase.auth.getUser()
        if (data.user) {
          // Đã đăng nhập thì đi thẳng về next
          router.replace(next)
          return
        }
      } finally {
        setLoading(false)
      }
    })()

    // 2) Lắng nghe sự kiện đăng nhập (trường hợp user bấm login xong quay lại đây)
    const { data: sub } = supabase.auth.onAuthStateChange((ev) => {
      if (ev === 'SIGNED_IN') {
        router.replace(next)
      }
    })
    unsub = () => sub.subscription.unsubscribe()

    return () => {
      if (unsub) unsub()
    }
  }, [params, router, supabase, next])

  // 3) Bắt đầu OAuth (Google) — đưa callback quay về lại /signup với redirectTo (đÃ sanitize)
  const loginWithGoogle = async () => {
    const origin = window.location.origin
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        // CHÚ Ý: quay về chính /signup để đoạn code ở trên `exchangeCodeForSession` thực hiện
        redirectTo: `${origin}/signup?redirectTo=${encodeURIComponent(next)}`
      },
    })
  }

  return (
    <div className="mx-auto max-w-md px-4 py-10">
      <h1 className="text-2xl font-semibold mb-4">Đăng nhập</h1>

      <p className="text-sm text-gray-600 mb-6">
        Bạn sẽ được chuyển về: <span className="font-medium">{next}</span>
      </p>

      <button
        onClick={loginWithGoogle}
        className="w-full rounded-md bg-black text-white py-2.5 font-medium hover:opacity-90"
      >
        Tiếp tục với Google
      </button>

      {!loading && (
        <p className="mt-6 text-xs text-gray-500">
          Nếu bạn đã đăng nhập, trang sẽ tự chuyển về điểm trước đó.
        </p>
      )}
    </div>
  )
}
