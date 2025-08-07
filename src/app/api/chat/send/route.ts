// src/app/api/chat/send/route.ts
import { NextResponse } from 'next/server'
import OpenAI           from 'openai'
import { z }            from 'zod'
import { createSupabaseRouteServerClient } from '@/lib/supabaseServer'
import { fetchBestContext } from '@/lib/rag'

const Body = z.object({
  threadId: z.string().uuid().optional(),
  content : z.string().min(1),
})

export async function POST(req: Request) {
  const { threadId: incomingThreadId, content: userQuestion } = Body.parse(
    await req.json()
  )

  // 1. Supabase SSR client
  const supabase = await createSupabaseRouteServerClient()

  // 2. Lấy user (có thể null)
  let userId: string | null = null
  try {
    const { data, error } = await supabase.auth.getUser()
    if (!error) userId = data.user?.id ?? null
  } catch (_) {
    // guest
  }

  // 3. Tạo hoặc reuse thread
  let threadId = incomingThreadId
  if (!threadId) {
    const { data, error } = await supabase
      .from('chat_threads')
      .insert({ user_id: userId })
      .select('id')
      .single()
    if (error || !data?.id) {
      console.error('Create thread error', error)
      return NextResponse.json({ error: 'Không tạo được cuộc trò chuyện' }, { status: 500 })
    }
    threadId = data.id
  }

  // 4. Lưu user message
  await supabase.from('chat_messages').insert({
    thread_id: threadId,
    user_id  : userId,
    role     : 'user',
    content  : userQuestion
  })

  // 5. Lấy 20 tin nhắn gần nhất
  const { data: history } = await supabase
    .from('chat_messages')
    .select('role, content')
    .eq('thread_id', threadId)
    .order('created_at', { ascending: false })
    .limit(20)

  // 6. Chuẩn bị system prompt
  const systemPrompt = `
Bạn là trợ lý AI Seven – chuyên gia 15 năm tư vấn nghề nhân sự.
Luôn trả lời thẳng vào câu hỏi, đừng hỏi ngược lại.
Khi có context (FAQ hay Blog), hãy tóm tắt trực tiếp thông tin đó.
Nếu không, hãy trả lời dựa trên kinh nghiệm tư vấn.
Trả lời ngắn gọn, thân thiện, bằng tiếng Việt.
`.trim()

  // 7. Lấy RAG context ưu tiên
  const { source, content: ragContent } = await fetchBestContext(userQuestion)
  console.log('🛠 RAG source=', source, 'content=', ragContent)

  // 8. Ghép messages với điều kiện
  const messages: OpenAI.ChatCompletionMessageParam[] = [
    { role: 'system',  content: systemPrompt },
    // nếu tìm được context từ FAQ hoặc blog, chèn ngay
    ...(source
      ? [{ role: 'system', content: `Thông tin tham khảo (${source}):\n${ragContent}` }]
      : []),
    // cuối cùng mới đến lịch sử chat
    ...((history ?? []).reverse() as any)
  ]

  // 9. Gọi OpenAI
  const openai = new OpenAI({
    apiKey     : process.env.OPENAI_API_KEY,
    baseOptions: { timeout: parseInt(process.env.OPENAI_TIMEOUT_MS ?? '30000') }
  })
  let assistantReply = 'Xin lỗi, hệ thống tạm thời không trả lời được.'
  try {
    const resp = await openai.chat.completions.create({
      model   : 'gpt-4o-mini',
      messages
    })
    assistantReply = resp.choices[0].message.content?.trim() ?? assistantReply
  } catch (e) {
    console.error('OpenAI error', e)
  }

  // 10. Lưu và trả về
  await supabase.from('chat_messages').insert({
    thread_id: threadId,
    user_id  : userId,
    role     : 'assistant',
    content  : assistantReply
  })

  return NextResponse.json({ threadId, content: assistantReply })
}
