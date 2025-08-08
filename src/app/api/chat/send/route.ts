// src/app/api/chat/send/route.ts
import { NextResponse } from "next/server";
import OpenAI from "openai";
import { z } from "zod";
import { createSupabaseRouteServerClient } from "@/lib/supabaseServer";
import { fetchBestContext } from "@/lib/rag";
import { summarizeHistory } from "@/lib/summary";
import { needsDetailAnswer } from "@/lib/intent";

const Body = z.object({
  threadId: z.string().uuid().optional(),
  content: z.string().min(1),
});

// ---- Heuristic: nhận diện câu hỏi follow-up hẹp/ngắn (trả lời đúng trọng tâm)
function isNarrowFollowUp(input: string) {
  const q = (input || "").trim().toLowerCase();
  if (!q) return false;
  const words = q.split(/\s+/).length;
  const shortWithWh =
    (q.length <= 42 || words <= 7) &&
    /(nào|ở đâu|bao nhiêu|mấy|bao lâu|khi nào|đâu|gì)\b/.test(q);
  const cues = [
    "trường nào",
    "học trường",
    "học phí",
    "bao lâu",
    "thời gian",
    "khai giảng",
    "điều kiện",
    "online",
    "offline",
    "địa điểm",
    "cơ sở",
    "chứng chỉ",
  ];
  const hasCue = cues.some((k) => q.includes(k));
  return shortWithWh || hasCue;
}

export async function POST(req: Request) {
  // 1) Parse body
  const { threadId: incomingThreadId, content: userQuestion } = Body.parse(
    await req.json()
  );

  // 2) Supabase SSR client
  const supabase = await createSupabaseRouteServerClient();

  // 3) Get user (nullable)
  let userId: string | null = null;
  try {
    const { data, error } = await supabase.auth.getUser();
    if (!error) userId = data.user?.id ?? null;
  } catch {}

  // 4) Create / reuse thread
  let threadId = incomingThreadId;
  if (!threadId) {
    const { data, error } = await supabase
      .from("chat_threads")
      .insert({ user_id: userId })
      .select("id")
      .single();
    if (error || !data?.id) {
      console.error("Create thread error", error);
      return NextResponse.json(
        { error: "Không tạo được cuộc trò chuyện" },
        { status: 500 }
      );
    }
    threadId = data.id;
  }

  // 5) Save user message
  await supabase.from("chat_messages").insert({
    thread_id: threadId,
    user_id: userId,
    role: "user",
    content: userQuestion,
  });

  // 6) Load full history (newest first)
  const { data: rawHistory } = await supabase
    .from("chat_messages")
    .select("role, content")
    .eq("thread_id", threadId)
    .order("created_at", { ascending: false });

  // chronological: oldest -> newest
  const history = (rawHistory ?? [])
    .map((h) => ({ role: h.role, content: h.content }))
    .reverse();

  // 7) Summarize long history
  const { summary, recent } = await summarizeHistory(
    history,
    process.env.OPENAI_API_KEY!
  );

  // 8) RAG (FAQ -> Blog)
  const { source, content: ragContent } = await fetchBestContext(userQuestion);
  console.log("🛠 RAG source=", source);

  // 9) Decide mode
  const useDetail = needsDetailAnswer(userQuestion);
  const followupNarrow = isNarrowFollowUp(userQuestion);

  // 10) System prompt
  const systemPrompt = `
Vai trò & mục tiêu
Bạn là Chuyên viên tư vấn hướng nghiệp & đào tạo của <TỔ CHỨC>. Nhiệm vụ: trả lời đúng trọng tâm, rõ ràng, 100% tiếng Việt, giúp người dùng:
- Hiểu ngành/nghề phù hợp, triển vọng, yêu cầu kỹ năng;
- Chọn trường/lớp/khóa học;
- Nhận lộ trình phát triển (3–6–12 tháng) và nội dung học đề xuất;
- Chuẩn bị hồ sơ, chi phí, thời lượng, đầu ra (khi có);
- Có bước tiếp theo cụ thể (CTA).

Nguồn dữ liệu & độ tin cậy
- Ưu tiên dữ liệu nội bộ và phần “Thông tin tham khảo (…)” trong context. Nếu có mâu thuẫn nguồn, nêu rõ và hỏi lại để làm rõ.
- Không bịa. Thiếu dữ liệu thì nói thẳng và đề xuất cách bổ sung (link, tài liệu, thông tin người dùng).
- Chỉ đưa link/giá/ưu đãi nếu có trong nguồn; nếu không có, nêu khoảng ước lượng và đánh dấu là ước tính.

Giọng điệu & phong cách
- Thân thiện nhưng thực tế; dùng “bạn/mình”; nếu bắt buộc dùng thuật ngữ, giải thích ngắn.

Khi bắt đầu / khi thông tin còn thiếu
- Thiếu ≥ 2 thông tin quan trọng: hỏi 3–5 câu ngắn trước khi tư vấn sâu (mục tiêu, nền tảng, thời gian, ngân sách, khu vực).
- Nếu đủ thông tin, có thể giả định nhẹ (nêu rõ giả định).

Nhận diện ý định & cách trả lời
- Ngành/nghề/phù hợp: mô tả ngắn, kỹ năng cốt lõi, đầu vào điển hình, triển vọng, vai trò khởi điểm.
- Trường/lớp: tiêu chí chọn (điểm chuẩn, vị trí, học phí, chương trình, thực tập, liên kết doanh nghiệp).
- Khóa học cụ thể: đối tượng, module chính, thời lượng, yêu cầu đầu vào, bài tập/đồ án, đầu ra kỹ năng, lộ trình sau khóa.
- Kinh nghiệm/đi làm: portfolio, chứng chỉ, dự án mẫu, JD junior, phỏng vấn, thực tập.
- Lộ trình học: mốc 3–6–12 tháng, tài nguyên học, tiêu chí hoàn thành (OKR), checklist.

Cấu trúc trả lời (DEFAULT)
1) Tóm tắt mục tiêu của bạn (1–2 câu).
2) Lộ trình đề xuất (3–6–12 tháng).
3) Khóa học/Chương trình phù hợp (ưu tiên khóa nội bộ <TỔ CHỨC> nếu có).
4) Nội dung học chính (5–8 gạch đầu dòng).
5) Thời lượng – chi phí – điều kiện.
6) Bước tiếp theo: tài liệu, test định hướng, lịch hẹn <LINK_TU_VAN>.
7) Những điểm cần làm rõ.

CHẾ ĐỘ TRẢ LỜI
- DEFAULT: dùng cấu trúc đầy đủ ở trên.
- FOLLOWUP_NARROW: khi người dùng hỏi hẹp/ngắn (vd: "học trường nào?", "học phí bao nhiêu?"):
  • Trả lời trực tiếp, đúng trọng tâm; KHÔNG lặp lại toàn bộ cấu trúc 6 phần.
  • Tối đa 3–6 gạch đầu dòng hoặc 1 đoạn ngắn; nêu tiêu chí/chọn lọc cụ thể, có thể đưa 3–5 gợi ý/tiêu chí.
  • Chỉ hỏi thêm TỐI ĐA 1 câu làm rõ nếu thật sự cần, kèm 1 bước tiếp theo ngắn gọn.
`.trim();

  // 11) Compose messages
  const messages: OpenAI.ChatCompletionMessageParam[] = [
    { role: "system", content: systemPrompt },
    {
      role: "system",
      content: followupNarrow
        ? "CHẾ ĐỘ: FOLLOWUP_NARROW — Trả lời đúng trọng tâm câu hỏi hẹp; không đổ khuôn; tối đa 1 câu hỏi làm rõ."
        : (useDetail
            ? "CHẾ ĐỘ: DEFAULT — Trả lời chi tiết (180–400 từ)."
            : "CHẾ ĐỘ: DEFAULT — Trả lời ngắn gọn (120–180 từ)."),
    },
    ...(summary
      ? [{ role: "system", content: `Tóm tắt hội thoại trước: ${summary}` }]
      : []),
    ...(source
      ? [{ role: "system", content: `Thông tin tham khảo (${source}):\n${ragContent}` }]
      : []),
    ...recent,
    { role: "user", content: userQuestion },
  ];

  // 12) Call OpenAI
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    baseOptions: { timeout: 30_000 },
  });

  let assistantReply = "Xin lỗi, hệ thống tạm thời không trả lời được.";
  try {
    const resp = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
      messages,
      temperature: followupNarrow ? 0.2 : useDetail ? 0.4 : 0.25,
      max_tokens: followupNarrow ? 220 : useDetail ? 600 : 200,
    });
    assistantReply = resp.choices[0].message.content?.trim() ?? assistantReply;
  } catch (e) {
    console.error("OpenAI error", e);
  }

  // 13) Save assistant reply
  await supabase.from("chat_messages").insert({
    thread_id: threadId,
    user_id: userId,
    role: "assistant",
    content: assistantReply,
  });

  // 14) Return to client
  return NextResponse.json({ threadId, content: assistantReply });
}
