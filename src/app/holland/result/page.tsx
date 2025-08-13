export const dynamic = "force-dynamic";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";

interface Props {
  searchParams: { code?: string; score?: string };
}

/* ── Giải thích 6 nhóm R-I-A-S-E-C ───────────────────── */
const TRAITS: Record<string, string> = {
  R: "Realistic – Ưa hành động, thao tác với vật thể.",
  I: "Investigative – Phân tích, khám phá, thích nghiên cứu.",
  A: "Artistic – Sáng tạo, trực giác, biểu đạt ý tưởng.",
  S: "Social – Hỗ trợ, hợp tác, giúp đỡ người khác.",
  E: "Enterprising – Thuyết phục, lãnh đạo, kinh doanh.",
  C: "Conventional – Tỉ mỉ, dữ liệu, quy trình, tổ chức.",
};

/* helper hiển thị mô tả 3 chữ code */
const explain = (code: string) =>
  code
    .split("")
    .map((c) => TRAITS[c] ?? c)
    .join(" | ");

export default async function HollandResultPage({ searchParams }: Props) {
  /* ------------------------------------------------------------------ */
  /* 0. Lấy & validate mã Holland & điểm radar                          */
  /* ------------------------------------------------------------------ */
  const { code = '' } = await searchParams
  const CODE = code.toUpperCase()
  if (!/^[RIASEC]{3}$/.test(code)) redirect("/holland");

  /* Giải mã điểm radar (base64-JSON) – nếu không có sẽ redirect */
  if (!searchParams.score) redirect("/holland");
  let score: Record<string, number>;
  try {
    score = JSON.parse(
      Buffer.from(searchParams.score, "base64").toString("utf8")
    );
  } catch {
    redirect("/holland");
  }

  /* ------------------------------------------------------------------ */
  /* 1. Supabase + Auth                                                 */
  /* ------------------------------------------------------------------ */
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?redirectedFrom=/holland");

  /* ------------------------------------------------------------------ */
  /* 2. Lưu kết quả vào DB                                              */
  /* ------------------------------------------------------------------ */
  /* 2a. Ghi lịch sử holland_results                                    */
  await supabase.from("holland_results").insert({
    user_id: user.id,
    code,
    score, // jsonb
  });

  /* 2b. Upsert vào career_profiles                                     */
  await supabase
    .from("career_profiles")
    .upsert(
      {
        user_id: user.id,
        holland_profile: score, // jsonb column
        updated_at: new Date(),
      },
      { onConflict: "user_id" }
    );

  /* 2c. Gửi tin nhắn vào chatbot                                       */
  await supabase.from("chat_messages").insert({
    user_id: user.id,
    role: "assistant",
    content: `🎉 Bạn vừa hoàn thành trắc nghiệm Holland. Kết quả là **${code}** ( ${explain(
      code
    )} ). Có cần tôi gợi ý nghề nghiệp phù hợp không?`,
  });

  /* ------------------------------------------------------------------ */
  /* 3. UI                                                              */
  /* ------------------------------------------------------------------ */
  return (
    <div className="max-w-3xl mx-auto py-20 space-y-10 text-center">
      <h1 className="text-3xl font-bold">Kết quả Holland: {code}</h1>

      {/* mô tả ngắn 3 chữ */}
      <div className="rounded-lg bg-white p-6 shadow text-left">
        <p>{explain(code)}</p>
      </div>

      {/* bảng điểm radar giản đơn */}
      <table className="mx-auto text-sm">
        <tbody>
          {Object.entries(score).map(([k, v]) => (
            <tr key={k}>
              <td className="pr-4 font-medium">{k}</td>
              <td>{v}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <a
        href="/profile?step=trait"
        className="inline-block rounded bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-700"
      >
        Xem Hồ sơ Phát triển nghề
      </a>
    </div>
  );
}
