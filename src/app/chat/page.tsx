// src/app/chat/page.tsx
import ChatLayout from "@/components/ChatLayout";
import { createSupabaseServerClient } from "@/lib/supabaseServer";

export default async function ChatPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return <ChatLayout userId={user?.id ?? null} />;
}
