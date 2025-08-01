export const dynamic = "force-dynamic";

import type { ReactNode } from "react";
import SupabaseProvider from "@/providers/SupabaseProvider";
import { createSupabaseReadOnly } from "@/lib/supabaseServer";   // ⬅️

export default async function ChatLayout({ children }: { children: ReactNode }) {
  const supabase = createSupabaseReadOnly();                    // ⬅️
  const { data: { session } } = await supabase.auth.getSession();

  return (
    <SupabaseProvider initialSession={session}>
      {children}
    </SupabaseProvider>
  );
}
