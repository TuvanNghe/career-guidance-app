// src/app/api/chat/threads/route.ts
import { NextResponse } from "next/server";
import { createSupabaseRouteServerClient } from "@/lib/supabaseServer";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const runtime = "nodejs";

export async function GET() {
  const supabase = await createSupabaseRouteServerClient();

  const { data: auth } = await supabase.auth.getUser();
  const userId = auth?.user?.id ?? null;
  if (!userId) return NextResponse.json([]);

  const { data, error } = await supabase
    .from("chat_threads")
    .select("id, title, updated_at")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false });

  if (error) {
    console.error("threads error:", error);
    return NextResponse.json([]);
  }
  return NextResponse.json(data ?? []);
}
