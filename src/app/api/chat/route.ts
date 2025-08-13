// src/app/api/chat/route.ts
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import OpenAI from 'openai'
import { createSupabaseRouteServerClient } from '@/lib/supabase/server'

const openai =
  process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null

const PostSchema = z.object({
  message: z.string().min(1),
  threadId: z.string().uuid().optional(),
})

/* ------------------------ Helper: quota theo gói ------------------------ */
// Quy tắc:
// - Free: 5 tin
// - Đã thanh toán Holland: 20 tin (ghi đè Free)
// - Đã thanh toán Knowdell: 100 tin (ghi đè Holland)
// - Gói nạp thêm: chat_50 (+50), chat_150 (+150) — cộng dồn
type Quota = { used: number; limit: number; remaining: number }

async function getQuota(
  supabase: Awaited<ReturnType<typeof createSupabaseRouteServerClient>>,
  userId: string
): Promise<Quota> {
  // Đếm số tin do user đã gửi (role='user')
  const { count: used = 0 } = await supabase
    .from('chat_messages')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('role', 'user')

  // Lấy các payment đã thanh toán
  const { data: payments, error: payErr } = await supabase
    .from('payments')
    .select('product, status')
    .eq('user_id', userId)
    .eq('status', 'paid')

  // Nếu bảng/ dữ liệu không tồn tại vẫn coi như chưa mua gì
  const list = payErr ? [] : payments ?? []

  let base = 5
  const hasKnowdell = list.some((p) => p.product === 'knowdell')
  const hasHolland = list.some((p) => p.product === 'holland')

  if (hasKnowdell) base = 100
  else if (hasHolland) base = 20

  let extras = 0
  for (const p of list) {
    if (p.product === 'chat_50') extras += 50
    else if (p.product === 'chat_150') extras += 150
  }

  const limit = base + extras
  const remaining = Math.max(0, limit - used)
  return { used, limit, remaining }
}

/* ------------------------------- GET ----------------------------------- */
/** GET /api/chat?threadId=...  → lịch sử + quota (để UI disable input khi hết lượt) */
export async function GET(req: NextRequest) {
  const supabase = await createSupabaseRouteServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const threadId = searchParams.get('threadId') || ''

  if (!threadId) {
    const quota = await getQuota(supabase, user.id)
    return NextResponse.json({ messages: [], quota })
  }

  const [{ data: messages, error }, quota] = await Promise.all([
    supabase
      .from('chat_messages')
      .select('id, role, content, created_at')
      .eq('user_id', user.id)
      .eq('thread_id', threadId)
      .order('created_at', { ascending: true }),
    getQuota(supabase, user.id),
  ])

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ messages: messages ?? [], quota })
}

/* ------------------------------- POST ---------------------------------- */
/**
 * POST /api/chat
 * body: { message: string, threadId?: string }
 * - Kiểm tra quota; nếu hết → trả 402 + gợi ý mua gói
 * - Tạo thread nếu chưa có, lưu user message
 * - Gọi LLM (nếu có API key), lưu assistant message
 * - Cập nhật updated_at của thread
 */
export async function POST(req: NextRequest) {
  const supabase = await createSupabaseRouteServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const json = await req.json()
  const parsed = PostSchema.safeParse(json)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  // 1) Kiểm tra hạn mức trước khi chấp nhận tin nhắn mới
  const quota = await getQuota(supabase, user.id)
  if (quota.remaining <= 0) {
    return NextResponse.json(
      {
        error: 'QUOTA_EXCEEDED',
        message:
          'Bạn đã dùng hết số tin nhắn của gói hiện tại. Vui lòng mua thêm để tiếp tục sử dụng.',
        quota,
        purchaseOptions: [
          { product: 'chat_50', messages: 50, price: 50000 },
          { product: 'chat_150', messages: 150, price: 100000 },
        ],
      },
      { status: 402 } // Payment Required
    )
  }

  const { message, threadId: maybeThreadId } = parsed.data
  let threadId = maybeThreadId || null

  // 2) Tạo thread nếu cần
  if (!threadId) {
    const title = message.slice(0, 80)
    const { data: t, error: eThread } = await supabase
      .from('chat_threads')
      .insert({ user_id: user.id, title })
      .select('id')
      .single()

    if (eThread || !t) {
      return NextResponse.json({ error: eThread?.message || 'THREAD_CREATE' }, { status: 400 })
    }
    threadId = t.id
  }

  // 3) Lưu user message
  {
    const { error } = await supabase.from('chat_messages').insert({
      thread_id: threadId,
      user_id: user.id,
      role: 'user',
      content: message,
    })
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  }

  // 4) Load context (tối đa 20 msg gần nhất)
  const { data: history } = await supabase
    .from('chat_messages')
    .select('role, content')
    .eq('user_id', user.id)
    .eq('thread_id', threadId)
    .order('created_at', { ascending: true })
    .limit(20)

  // 5) Gọi LLM (fallback nếu thiếu API key)
  let assistantText = 'Mình đã nhận được câu hỏi của bạn và đang xử lý.'
  if (openai) {
    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content:
              'Bạn là trợ lý hướng nghiệp tích hợp vào website. Trả lời ngắn gọn, rõ ràng, và thân thiện.',
          },
          ...(history || []).map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content })),
        ],
      })
      assistantText =
        completion.choices[0]?.message?.content?.trim() || 'Mình đã nhận được câu hỏi của bạn.'
    } catch (err) {
      console.error('OpenAI error:', err)
    }
  }

  // 6) Lưu assistant + cập nhật thread
  const [{ error: eAsst }, { error: eThreadUpdate }] = await Promise.all([
    supabase.from('chat_messages').insert({
      thread_id: threadId,
      user_id: user.id,
      role: 'assistant',
      content: assistantText,
    }),
    supabase
      .from('chat_threads')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', threadId)
      .eq('user_id', user.id),
  ])

  if (eAsst) return NextResponse.json({ error: eAsst.message }, { status: 400 })
  if (eThreadUpdate) return NextResponse.json({ error: eThreadUpdate.message }, { status: 400 })

  // Có thể trả lại quota mới để UI hiển thị còn lại
  const newQuota = await getQuota(supabase, user.id)
  return NextResponse.json({ threadId, assistant: assistantText, quota: newQuota })
}
