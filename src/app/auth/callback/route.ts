// src/app/auth/callback/route.ts
import { createSupabaseUserClient } from "@/lib/supabaseServer";
import { NextResponse } from "next/server";

export const runtime = "edge";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next") || "/";

  if (!code) return NextResponse.redirect(new URL("/", url.origin));

  const supabase = createSupabaseUserClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) return NextResponse.redirect(new URL(`/signup?error=${error.message}`, url.origin));

  return NextResponse.redirect(new URL(next, url.origin));
}
