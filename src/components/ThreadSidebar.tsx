'use client'
import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabaseChat as supabase } from '@/lib/supabaseChat/client'

type Thread = {
  id: string
  title: string | null
  updated_at: string
}

type LastMap = Record<string, { content: string; created_at: string }>

export default function ThreadSidebar() {
  const [threads, setThreads] = useState<Thread[]>([])
  const [lastByThread, setLastByThread] = useState<LastMap>({})
  const router = useRouter()
  const search = useSearchParams()
  const activeId = search.get('threadId')

  useEffect(() => {
    const load = async () => {
      // 1) Lấy danh sách thread (không đụng cột last_message)
      const { data: t } = await supabase
        .from('chat_threads')
        .select('id, title, updated_at')
        .order('updated_at', { ascending: false })
      const list = t || []
      setThreads(list)

      // 2) Lấy tin nhắn cuối mỗi thread (gộp 1 query, group ở client)
      if (list.length) {
        const ids = list.map((x) => x.id)
        const { data: msgs } = await supabase
          .from('chat_messages')
          .select('thread_id, content, created_at')
          .in('thread_id', ids)
          .order('created_at', { ascending: false })

        const map: LastMap = {}
        for (const m of msgs || []) {
          if (!map[m.thread_id as string]) {
            map[m.thread_id as string] = { content: m.content as string, created_at: m.created_at as string }
          }
        }
        setLastByThread(map)
      } else {
        setLastByThread({})
      }
    }

    load()

    const channel = supabase
      .channel('threads-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'chat_threads' }, load)
      .subscribe()
    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  return (
    <aside className="w-72 border-r h-full overflow-y-auto">
      <div className="p-3 text-sm text-gray-500">Cuộc trò chuyện</div>
      <ul>
        {threads.map((t) => (
          <li key={t.id}>
            <button
              onClick={() => router.replace(`/chat?threadId=${t.id}`)}
              className={`w-full text-left p-3 hover:bg-gray-50 ${activeId === t.id ? 'bg-gray-100' : ''}`}
            >
              <div className="truncate font-medium">{t.title || 'Cuộc trò chuyện mới'}</div>
              <div className="truncate text-xs text-gray-500">{lastByThread[t.id]?.content ?? ''}</div>
            </button>
          </li>
        ))}
      </ul>
    </aside>
  )
}