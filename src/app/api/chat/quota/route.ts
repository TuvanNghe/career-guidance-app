import { NextResponse } from "next/server";
import { createSupabaseRouteClient } from "@/lib/supabaseServer";
export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = await createSupabaseRouteClient();
  const { data: { user } } = await supabase.auth.getUser();

  const LIMIT = 100;
  if (!user) return NextResponse.json({ used: 0, limit: LIMIT, scope: "guest" });

  const { count } = await supabase
    .from("chat_messages")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id);

  return NextResponse.json({ used: count ?? 0, limit: LIMIT, scope: "user" });
}
