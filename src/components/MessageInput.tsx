'use client'
import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useSWRConfig } from 'swr'
import type { Msg } from './MessageList'

type Props = {
  onDraft?: (m: Msg) => void
  onClearDraft?: () => void
}

export default function MessageInput({
  onDraft = () => {},
  onClearDraft = () => {},
}: Props) {
  const [value, setValue] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const search = useSearchParams()
  const threadId = search.get('threadId')
  const { mutate } = useSWRConfig()

  const send = async () => {
    if (!value.trim() || loading) return
    setLoading(true)

    const optimisticMsg: Msg = {
      id: `opt-${Date.now()}`,
      role: 'user',
      content: value,
      created_at: new Date().toISOString(),
    }
    const key = threadId ? `/api/chat?threadId=${threadId}` : null

    // === 1) Optimistic UI + CLEAR INPUT NGAY LẬP TỨC ===
    const prev = value
    setValue('') // ⟵ clear ngay khi bấm gửi
    if (!threadId) {
      onDraft(optimisticMsg)
    } else {
      await mutate(
        key!,
        (prevData: any) => ({ messages: [...(prevData?.messages || []), optimisticMsg] }),
        false
      )
    }

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: prev, threadId: threadId || undefined }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Send failed')

      // 2) Nếu là thread mới → cập nhật URL + load lại
      if (!threadId && json.threadId) {
        router.replace(`/chat?threadId=${json.threadId}`)
        onClearDraft()
        await mutate(`/api/chat?threadId=${json.threadId}`)
      } else if (threadId) {
        await mutate(key!)
      }
    } catch (e) {
      console.error(e)
      // Khôi phục input nếu lỗi gửi
      setValue(prev)
      if (threadId) await mutate(key!) // rollback append lạc quan bằng revalidate
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="border-t p-3 flex gap-2">
      <textarea
        className="flex-1 resize-none border rounded-xl p-3 focus:outline-none focus:ring"
        rows={2}
        placeholder="Nhập câu hỏi…"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            send()
          }
        }}
      />
      <button
        onClick={send}
        disabled={loading || !value.trim()}
        className="px-4 py-2 rounded-xl bg-black text-white disabled:opacity-50"
      >
        {loading ? 'Đang gửi…' : 'Gửi'}
      </button>
    </div>
  )
}
