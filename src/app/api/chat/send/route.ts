import { NextResponse } from "next/server";
import { z } from "zod";
import OpenAI from "openai";
import { createSupabaseServerClient } from "@/lib/supabaseServer";

export const runtime = "edge";          // Vercel Edge Function

/* --------- validate body --------- */
const Body = z.object({
  threadId: z.string().optional().nullable(),
  content : z.string().min(1, "message rỗng"),
  userId  : z.string().uuid().optional().nullable(),
});

/* regex uuid v4 */
const isUUIDv4 = (s?: string | null) =>
  !!s && /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(s);

/* --------- SYSTEM PROMPT --------- */
const SYSTEM_PROMPT = `
Bạn là *Trợ lý Seven* – **chuyên gia tư vấn nghề nghiệp** với hơn 10 năm kinh nghiệm:
• Chứng chỉ quốc tế về MBTI, Holland (RIASEC), Knowdell card-sort.
• Thường xuyên cập nhật dữ liệu ngành nghề, mức lương, cơ hội thăng tiến và lộ trình phát triển.

**Quy tắc trả lời**
1. Chỉ *chào hỏi* ở tin nhắn đầu tiên trong một cuộc trò chuyện.
2. Luôn trả lời ngắn gọn (≤ 150 từ) nhưng đủ ý, ưu tiên tiếng Việt chuẩn.
3. Nếu câu hỏi liên quan MBTI / Holland / Knowdell -> giải thích khái niệm + gợi ý nghề.
4. Nếu hỏi về lộ trình nghề nghiệp -> trình bày các bước WHAT-WHY-HOW và kỹ năng cần học.
5. Nếu chưa rõ câu hỏi -> hỏi lại để làm rõ nhu cầu.
`;

export async function POST(req: Request) {
  const body = Body.parse(await req.json());

  /* bảo đảm threadId hợp lệ */
  const threadId = isUUIDv4(body.threadId) ? body.threadId! : crypto.randomUUID();

  const supabase = createSupabaseServerClient();
  const openai   = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

  /* upsert thread */
  await supabase
    .from("chat_threads")
    .upsert({ id: threadId, title: body.content.slice(0, 50) }, { onConflict: "id" });

  /* lưu message user */
  await supabase.from("chat_messages").insert({
    thread_id: threadId,
    role     : "user",
    content  : body.content,
    user_id  : body.userId,
  });

  /* lấy toàn bộ lịch sử */
  const { data: history } = await supabase
    .from("chat_messages")
    .select("role, content")
    .eq("thread_id", threadId)
    .order("created_at");

  /* gọi GPT-4o-mini */
  const completion = await openai.chat.completions.create({
    model   : "gpt-4o-mini",
    messages: [
      { role: "system", content: SYSTEM_PROMPT.trim() },
      ...(history ?? []).map((m) => ({
        role   : m.role as "user" | "assistant",
        content: m.content,
      })),
    ],
  });

  const assistantReply = completion.choices[0].message.content ?? "";

  /* lưu phản hồi assistant */
  await supabase.from("chat_messages").insert({
    thread_id: threadId,
    role     : "assistant",
    content  : assistantReply,
  });

  return NextResponse.json({ assistantReply, threadId });
}
