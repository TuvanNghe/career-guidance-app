/* Đổi code PKCE → session, ghi cookie rồi chuyển trang */
import { NextRequest, NextResponse } from "next/server";
import { createBrowserClient } from "@supabase/ssr";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  const url  = new URL(req.url);
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next") || "/";

  if (!code) return NextResponse.redirect(new URL("/signup", url));

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error)
    return NextResponse.redirect(new URL(`/signup?e=${encodeURIComponent(error.message)}`, url));

  return NextResponse.redirect(new URL(next, url));
}
