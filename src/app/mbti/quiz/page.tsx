// src/app/mbti/quiz/page.tsx (đầu file)
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabaseServer";

type Search = Promise<Record<string, string | undefined>>;

export default async function MbtiQuizPage({
  searchParams,
}: {
  searchParams: Search;
}) {
  const sp = await searchParams; // ✅ Next 15 yêu cầu await
  if (sp.start !== "1") redirect("/mbti");

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/signup?redirectTo=/mbti");

  // ... phần còn lại giữ nguyên ...
}
