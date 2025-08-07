// src/app/knowdell/page.tsx
export const dynamic = "force-dynamic";
export const metadata = {
  title: "Knowdell Card Sort – Career Guidance",
  description:
    "Khám phá giá trị cốt lõi của bạn thông qua trò chơi Knowdell Card Sort và xây dựng hồ sơ phát triển nghề nghiệp.",
};

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { STATUS } from "@/lib/constants";

import KnowdellLanding from "./KnowdellLanding";  // trang landing khi chưa login
import KnowdellIntro   from "./KnowdellIntro";    // component UI đã có sẵn

export default async function KnowdellPage() {
  // 1️⃣ Auth
  const supabase = createServerComponentClient({ cookies });
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 2️⃣ Nếu CHƯA login → show Landing
  if (!user) {
    return <KnowdellLanding />;
  }

  // 3️⃣ Kiểm tra đã thanh toán Knowdell?
  const { data: pay } = await supabase
    .from("payments")
    .select("id")
    .eq("user_id", user.id)
    .eq("product", "knowdell")
    .eq("status", STATUS.PAID)
    .maybeSingle();
  const hasPaid = !!pay;

  // 4️⃣ Kiểm tra đã có kết quả Knowdell?
  const { data: prof } = await supabase
    .from("career_profiles")
    .select("knowdell")
    .eq("user_id", user.id)
    .maybeSingle();
  const hasResult =
    Array.isArray(prof?.knowdell?.values) &&
    prof!.knowdell.values.length > 0;

  // 5️⃣ Render Intro với props
  return <KnowdellIntro hasPaid={hasPaid} hasResult={hasResult} />;
}
