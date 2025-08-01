import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabaseServer";

export const runtime = "edge";

/* validate query */
const Query = z.object({ threadId: z.string().uuid() });

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const parse = Query.safeParse(Object.fromEntries(searchParams));
  if (!parse.success)
    return NextResponse.json({ error: "threadId (uuid) required" }, { status: 400 });

  const { threadId } = parse.data;
  const supabase = createSupabaseServerClient();

  /* yêu cầu đã đăng nhập */
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session)
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

  const { data, error } = await supabase
    .from("chat_messages")
    .select("id, role, content, created_at")
    .eq("thread_id", threadId)
    .eq("user_id", session.user.id)
    .order("created_at");

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
