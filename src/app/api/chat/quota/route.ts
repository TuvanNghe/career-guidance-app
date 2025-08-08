// src/app/api/chat/quota/route.ts
import { NextResponse } from "next/server";
import { createSupabaseRouteServerClient } from "@/lib/supabaseServer";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const runtime = "nodejs";

const LIMIT = Number(process.env.QUOTA_MESSAGE_LIMIT ?? 100);

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const threadId = searchParams.get("threadId") ?? null;

  const supabase = await createSupabaseRouteServerClient();

  // Ưu tiên đếm THEO USER (ổn định cho gói mua); nếu không có session thì fallback theo thread
  const { data: auth } = await supabase.auth.getUser();
  const userId = auth?.user?.id ?? null;

  let used = 0;

  if (userId) {
    const { count, error } = await supabase
      .from("chat_messages")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("role", "user"); // chỉ đếm tin của user
    if (!error && typeof count === "number") used = count;
  } else if (threadId) {
    const { count, error } = await supabase
      .from("chat_messages")
      .select("id", { count: "exact", head: true })
      .eq("thread_id", threadId)
      .eq("role", "user");
    if (!error && typeof count === "number") used = count;
  }

  const remaining = Math.max(LIMIT - used, 0);
  return NextResponse.json({ limit: LIMIT, used, remaining });
}
