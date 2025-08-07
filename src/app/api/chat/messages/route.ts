// src/app/api/chat/messages/route.ts
import { NextResponse } from 'next/server'
import { createSupabaseRouteServerClient } from '@/lib/supabaseServer'

export async function GET(req: Request) {
  // 1. Lấy threadId từ query
  const { searchParams } = new URL(req.url)
  const threadId = searchParams.get('threadId')
  if (!threadId) {
    return NextResponse.json(
      { error: 'Missing threadId' },
      { status: 400 }
    )
  }

  // 2. Khởi tạo Supabase client server-side
  const supabase = await createSupabaseRouteServerClient()

  // 3. Query messages
  const { data, error } = await supabase
    .from('chat_messages')
    .select('id, role, content, created_at')
    .eq('thread_id', threadId)
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Supabase error fetching messages:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }

  // 4. Trả về mảng messages
  return NextResponse.json(data)
}
