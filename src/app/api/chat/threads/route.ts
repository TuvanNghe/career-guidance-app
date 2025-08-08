import { NextResponse } from "next/server";
import { createSupabaseRouteClient } from "@/lib/supabaseServer";
export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = await createSupabaseRouteClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json([]);

  const { data } = await supabase
    .from("chat_threads")
    .select("id, title, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return NextResponse.json(data ?? []);
}
