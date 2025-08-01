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
Bạn là Trợ lý Seven – chuyên gia 10+ năm về MBTI, Holland (RIASEC) & Knowdell card-sort.
Nhiệm vụ:
1. Chỉ chào ở **tin nhắn đầu** của mỗi cuộc trò chuyện.
2. Khi người dùng hỏi về:
   • **Holland / RIASEC** – giải thích mô hình + gợi ý nghề & lộ trình kỹ năng.
   • **Knowdell** – giải thích giá trị nghề nghiệp, cách chơi card-sort, ví dụ.
   • **Ngành nghề / lộ trình** – liệt kê 3-5 bước WHAT-WHY-HOW, kỹ năng, chứng chỉ.
3. Từ tin nhắn thứ 2 trở đi, trả lời **trực tiếp**, KHÔNG hỏi lại cùng câu hỏi.
4. Giới hạn 120-150 từ, ngôn ngữ: tiếng Việt trang trọng, dễ hiểu.
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
