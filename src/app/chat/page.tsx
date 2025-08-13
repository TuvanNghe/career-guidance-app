// Hiển thị lịch sử chat: luôn có threadId
export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import ThreadSidebar from '@/components/ThreadSidebar'
import MessageList from '@/components/MessageList'
import MessageInput from '@/components/MessageInput'

export default async function ChatPage({
  searchParams,
}: {
  searchParams: { threadId?: string }
}) {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/signup?redirectedFrom=/chat')

  let threadId = searchParams.threadId ?? undefined

  // Nếu không có threadId → lấy thread mới nhất rồi redirect
  if (!threadId) {
    const { data: latest } = await supabase
      .from('chat_threads')
      .select('id')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (latest?.id) {
      redirect(`/chat?threadId=${latest.id}`)
    }
  }

  // Render: nếu vẫn chưa có threadId => cuộc trò chuyện mới (chưa có lịch sử)
  return (
    <div className="h-[100dvh] flex">
      <ThreadSidebar />
      <main className="flex-1 flex flex-col">
        <div className="flex-1 overflow-y-auto">
          <MessageList threadId={threadId ?? null} />
        </div>
        <MessageInput />
      </main>
    </div>
  )
}
