// src/app/api/chat/send/route.ts
import { NextResponse } from "next/server";
import OpenAI from "openai";
import { z } from "zod";
import { createSupabaseRouteServerClient } from "@/lib/supabaseServer";
import { fetchBestContext } from "@/lib/rag";
import { summarizeHistory } from "@/lib/summary";
import { needsDetailAnswer } from "@/lib/intent";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const Body = z.object({
  threadId: z.string().uuid().optional(),
  content: z.string().min(1),
});

const MESSAGE_LIMIT = Number(process.env.QUOTA_MESSAGE_LIMIT ?? 100);

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
  // 1) Parse body (trả 400 nếu sai định dạng)
  let incomingThreadId: string | undefined;
  let userQuestion: string;
  try {
    const parsed = Body.parse(await req.json());
    incomingThreadId = parsed.threadId;
    userQuestion = parsed.content.trim();
  } catch (e) {
    return NextResponse.json(
      { error: "BAD_REQUEST", message: "Body không hợp lệ." },
      { status: 400 }
    );
  }

  // 2) Supabase server (Route) client
  const supabase = await createSupabaseRouteServerClient();

  // 3) Get user (nullable)
  let userId: string | null = null;
  try {
    const { data, error } = await supabase.auth.getUser();
    if (!error) userId = data.user?.id ?? null;
  } catch {
    // bỏ qua – xem như khách
  }

  // 3.1) Kiểm tra quota TRƯỚC khi lưu (đếm role='user')
  let used = 0;
  if (userId) {
    const { count } = await supabase
      .from("chat_messages")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("role", "user");
    used = count ?? 0;
  } else if (incomingThreadId) {
    // Với khách (không có userId), giới hạn theo thread
    const { count } = await supabase
      .from("chat_messages")
      .select("id", { count: "exact", head: true })
      .eq("thread_id", incomingThreadId)
      .eq("role", "user");
    used = count ?? 0;
  }
  if (used >= MESSAGE_LIMIT) {
    return NextResponse.json(
      {
        error: "QUOTA_EXCEEDED",
        message: `Bạn đã dùng hết ${MESSAGE_LIMIT} tin nhắn. Vui lòng mua thêm gói để tiếp tục.`,
        limit: MESSAGE_LIMIT,
        used,
      },
      { status: 403 }
    );
  }

  // 4) Create / reuse thread
  let threadId = incomingThreadId;
  if (!threadId) {
    const title = userQuestion.slice(0, 60);
    const { data, error } = await supabase
      .from("chat_threads")
      .insert({ user_id: userId, title })
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
  } else {
    // nếu thread cũ chưa có user, claim về user hiện tại
    if (userId) {
      await supabase
        .from("chat_threads")
        .update({ user_id: userId })
        .eq("id", threadId)
        .is("user_id", null);

      // Backfill user_id cho các tin nhắn cũ role=user thuộc thread này
      await supabase
        .from("chat_messages")
        .update({ user_id: userId })
        .eq("thread_id", threadId)
        .is("user_id", null)
        .eq("role", "user");
    }

    // nếu thread chưa có title thì set từ câu hỏi đầu tiên có nội dung
    const { data: t } = await supabase
      .from("chat_threads")
      .select("title")
      .eq("id", threadId)
      .single();
    if (!t?.title && userQuestion) {
      await supabase
        .from("chat_threads")
        .update({ title: userQuestion.slice(0, 60) })
        .eq("id", threadId);
    }
  }

  // 5) Save user message
  await supabase.from("chat_messages").insert({
    thread_id: threadId,
    user_id: userId,
    role: "user",
    content: userQuestion,
  });

  // Cập nhật updated_at để danh sách thread không “mất”
  await supabase
    .from("chat_threads")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", threadId);

  // 6) Load full history (newest first) → đảo lại chronological
  const { data: rawHistory } = await supabase
    .from("chat_messages")
    .select("role, content")
    .eq("thread_id", threadId)
    .order("created_at", { ascending: false });

  const history =
    (rawHistory ?? [])
      .map((h) => ({ role: h.role as "user" | "assistant" | "system", content: h.content }))
      .reverse();

  // 7) Summarize long history
  const { summary, recent } = await summarizeHistory(
    history,
    process.env.OPENAI_API_KEY!
  );

  // 8) RAG (FAQ -> Blog)
  const { source, content: ragContent } = await fetchBestContext(userQuestion);
  // console.log("🛠 RAG source=", source);

  // 9) Decide mode
  const useDetail = needsDetailAnswer(userQuestion);
  const followupNarrow = isNarrowFollowUp(userQuestion);

  // 10) System prompt (GIỮ NGUYÊN Ý, chỉ chỉnh format)
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
        : useDetail
        ? "CHẾ ĐỘ: DEFAULT — Trả lời chi tiết (180–400 từ)."
        : "CHẾ ĐỘ: DEFAULT — Trả lời ngắn gọn (120–180 từ).",
    },
    ...(summary
      ? [{ role: "system", content: `Tóm tắt hội thoại trước: ${summary}` }]
      : []),
    ...(source
      ? [{ role: "system", content: `Thông tin tham khảo (${source}):\n${ragContent}` }]
      : []),
    // recent là mảng [{ role, content }, ...]
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
    assistantReply = resp.choices[0].message.content?.trim() || assistantReply;
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

  // Đồng bộ updated_at lần nữa (để thread nhảy lên đầu danh sách)
  await supabase
    .from("chat_threads")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", threadId);

  // 14) Return to client
  return NextResponse.json({
    threadId,
    content: assistantReply,
    // Bonus: cho phép client tự cập nhật counter ngay, nếu có dùng
    usage: { used: used + 1, limit: MESSAGE_LIMIT },
  });
}
