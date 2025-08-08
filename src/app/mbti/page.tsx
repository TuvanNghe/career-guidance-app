// src/app/mbti/page.tsx
export const metadata = {
  title: "MBTI – Career Guidance",
  description:
    "Khám phá tính cách MBTI và cách nó hỗ trợ định hướng nghề nghiệp của bạn.",
};

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import MbtiLanding from "./MbtiLanding";
import MbtiIntro from "./MbtiIntro";

export default async function MbtiPage() {
  const supabase = await createSupabaseServerClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return <MbtiLanding />;

  const { data: profile } = await supabase
    .from("career_profiles")
    .select("mbti_type")
    .eq("user_id", user.id)
    .maybeSingle();

  if (profile?.mbti_type) redirect("/mbti/quiz?start=1");
  return <MbtiIntro hasResult={false} />;
}
