import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabaseServer";

export const runtime = "edge";                // chạy trên Edge Function

/* validate query string */
const Query = z.object({
  threadId: z.string().uuid(),
});

export async function GET(req: Request) {
  /* --------- lấy threadId --------- */
  const { searchParams } = new URL(req.url);
  const parse = Query.safeParse(Object.fromEntries(searchParams));
  if (!parse.success) {
    return NextResponse.json(
      { error: "threadId (uuid) is required" },
      { status: 400 },
    );
  }
  const { threadId } = parse.data;

  /* --------- Supabase client --------- */
  const supabase = createSupabaseServerClient(); // đã đọc biến môi trường

  /* --------- truy vấn --------- */
  const { data, error } = await supabase
    .from("chat_messages")
    .select("id, role, content, created_at")
    .eq("thread_id", threadId)
    .order("created_at");

  if (error) {
    console.error("[chat/messages]", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
