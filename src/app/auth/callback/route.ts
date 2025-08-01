// src/app/auth/callback/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createSupabaseUserClient } from "@/lib/supabaseServer";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  const url   = new URL(req.url);
  const code  = url.searchParams.get("code");
  const state = url.searchParams.get("state");           // nếu dùng PKCE

  if (!code) return NextResponse.redirect(new URL("/signup?error=NoCode", url));

  const supabase = createSupabaseUserClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    return NextResponse.redirect(new URL(`/signup?error=${error.message}`, url));
  }

  // ✅ cookie sb-access / sb-refresh đã được ghi
  const next = state?.split("|")[1] ?? "/";               // tuỳ cách gởi state
  return NextResponse.redirect(new URL(next, url));
}
