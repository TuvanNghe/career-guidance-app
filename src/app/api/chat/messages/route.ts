import { createSupabaseUserClient } from "@/lib/supabaseServer";

export async function GET(req: Request) {
  // ... validate threadId
  const supabase = createSupabaseUserClient();          // ⬅️ đổi sang UserClient

  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) return NextResponse.json({ error: "unauth" }, { status: 401 });

  const { data, error } = await supabase
    .from("chat_messages")
    .select("id, role, content, created_at")
    .eq("thread_id", threadId)
    .eq("user_id", session.user.id)                     // RLS still active
    .order("created_at");

  /* ... return JSON ... */
}
