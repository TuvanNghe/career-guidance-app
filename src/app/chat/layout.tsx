/* Chat subtree layout – server component */
export const dynamic = "force-dynamic";
import type { ReactNode } from "react";
import SupabaseProvider from "@/providers/SupabaseProvider";
import { createSupabaseServerClient } from "@/lib/supabaseServer";

export const metadata = { title: "Chat | CareerAI" };

export default async function ChatLayout({ children }: { children: ReactNode }) {
  /* Chỉ lấy session khi truy cập /chat */
  const supabase = createSupabaseServerClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  return (
    /* Provider chỉ áp dụng cho /chat và các trang con */
    <SupabaseProvider initialSession={session}>{children}</SupabaseProvider>
  );
}
