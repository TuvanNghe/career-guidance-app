import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { sendMail } from "@/lib/mail";

export const runtime = "nodejs"; // đảm bảo dùng Node runtime cho thư viện mail

export async function POST(req: NextRequest) {
  const supa = createRouteHandlerClient({ cookies });

  // 1) Lấy user hiện tại
  const { data: { user } } = await supa.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauth" }, { status: 401 });
  }

  // 2) Lấy hồ sơ của user
  const { data: profile } = await supa
    .from("career_profiles")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (!profile) {
    return NextResponse.json({ error: "No profile" }, { status: 404 });
  }

  // 3) Đọc body request (email người nhận, tiêu đề tuỳ chọn)
  const body = await req.json().catch(() => ({} as any));
  const to: string =
    body?.to || user.email || ""; // fallback gửi cho chính user nếu không truyền "to"
  const subject: string =
    body?.subject || "Chia sẻ hồ sơ hướng nghiệp của tôi";

  // 4) Render nội dung email (HTML & text)
  const valuesList = Array.isArray(profile?.knowdell?.values)
    ? profile.knowdell.values
    : [];
  const skillsList = Array.isArray(profile?.knowdell?.skills)
    ? profile.knowdell.skills
    : [];
  const interestsList = Array.isArray(profile?.knowdell?.interests)
    ? profile.knowdell.interests
    : [];

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const html = `
    <div style="font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;line-height:1.6">
      <h2 style="margin:0 0 12px">Hồ sơ Phát triển nghề của bạn</h2>
      <ul>
        <li><b>MBTI:</b> ${profile?.mbti?.type ?? "Chưa có"}</li>
        <li><b>Holland:</b> ${profile?.holland?.code ?? "Chưa có"}</li>
        <li><b>Giá trị:</b> ${
          valuesList.map((v: any) => v?.name ?? v).slice(0, 10).join(", ") || "—"
        }</li>
        <li><b>Kỹ năng:</b> ${
          skillsList.map((s: any) => s?.name ?? s).slice(0, 10).join(", ") || "—"
        }</li>
        <li><b>Sở thích:</b> ${
          interestsList.map((i: any) => i?.name ?? i).slice(0, 10).join(", ") || "—"
        }</li>
      </ul>
      <p>Xem trực tuyến: 
        <a href="${appUrl}/phongtran?uid=${encodeURIComponent(user.id)}">
          Mở hồ sơ
        </a>
      </p>
    </div>
  `;

  const text = `MBTI: ${profile?.mbti?.type ?? "Chưa có"}
Holland: ${profile?.holland?.code ?? "Chưa có"}
Giá trị: ${valuesList.map((v: any) => v?.name ?? v).join(", ")}
Kỹ năng: ${skillsList.map((s: any) => s?.name ?? s).join(", ")}
Sở thích: ${interestsList.map((i: any) => i?.name ?? i).join(", ")}
Xem hồ sơ: ${appUrl}/phongtran?uid=${user.id}
`;

  // 5) Gửi email qua helper (không còn import @sendgrid/mail ở route này)
  const from = process.env.SENDGRID_FROM || "Career App <no-reply@example.com>";
  const result = await sendMail({ to, from, subject, html, text });

  // Nếu chưa cấu hình key hợp lệ, không throw để tránh fail build/dev
  if (!result.ok) {
    return NextResponse.json(
      { ok: false, error: "email_not_configured" },
      { status: 200 }
    );
  }

  return NextResponse.json({ ok: true });
}
