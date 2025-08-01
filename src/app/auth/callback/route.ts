import { createSupabaseUserClient } from "@/lib/supabaseServer";
import { NextResponse } from "next/server";

export const runtime = "edge";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next") || "/";

  /* Không có code → về trang chủ */
  if (!code) return NextResponse.redirect(new URL("/", url.origin));

  /* Dùng anon-key vì đây là phiên của người dùng */
  const supabase = createSupabaseUserClient();

  /* ĐỔI code -> session -> set cookie & localStorage */
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error)
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(error.message)}`, url.origin),
    );

  /* 👉 Redirect tiếp tới trang người dùng muốn tới */
  return NextResponse.redirect(new URL(next, url.origin));
}
