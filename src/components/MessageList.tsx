'use client'
import useSWR from 'swr'

export type Msg = { id: string; role: 'user' | 'assistant' | 'system'; content: string; created_at: string }

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export default function MessageList({
  threadId,
  draftMessages = []
}: {
  threadId?: string | null
  draftMessages?: Msg[]
}) {
  const { data } = useSWR(threadId ? `/api/chat?threadId=${threadId}` : null, fetcher)
  const messages: Msg[] = data?.messages || []

  // Nếu chưa có threadId, hiển thị luôn draftMessages (Optimistic UI)
  const merged: Msg[] = threadId ? messages : draftMessages

  if (!threadId && merged.length === 0) {
    return <div className="p-6 text-gray-500">Bắt đầu cuộc trò chuyện mới…</div>
  }

  return (
    <div className="flex flex-col gap-3 p-4">
      {merged.map((m) => (
        <div key={m.id} className={`max-w-3xl ${m.role === 'user' ? 'self-end' : 'self-start'}`}>
          <div className={`rounded-2xl p-3 shadow-sm ${m.role === 'user' ? 'bg-blue-50' : 'bg-gray-50'}`}>
            <div className="whitespace-pre-wrap leading-relaxed">{m.content}</div>
          </div>
        </div>
      ))}
    </div>
  )
}