// src/app/holland/page.tsx
/* Server-component: quyết định render Landing hay Intro cho Holland */
export const dynamic = "force-dynamic";
export const metadata = {
  title: "Holland Test – Career Guidance",
  description:
    "Khám phá sở thích nghề nghiệp theo mô hình Holland (RIASEC) để định hướng công việc phù hợp.",
};

import { createSupabaseServerClient } from '@/lib/supabase/server'
import { cookies } from "next/headers";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { STATUS } from "@/lib/constants";

import HollandLanding from "./HollandLanding"; // trang landing (chưa login)
import HollandIntro from "./HollandIntro";     // component UI (login rồi)

export default async function HollandPage() {
  // 1️⃣ Lấy session user
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 2️⃣ Nếu CHƯA login → show Landing
  if (!user) {
    return <HollandLanding />;
  }

  // 3️⃣ Kiểm tra xem user đã thanh toán Holland/Knowdell chưa
  const { data: payments } = await supabase
    .from("payments")
    .select("product, status")
    .eq("user_id", user.id)
    .eq("status", STATUS.PAID);

  const hasPaid = (payments ?? []).some(
    (p) => p.product === "holland" || p.product === "knowdell"
  );

  // 4️⃣ Kiểm tra xem user đã có kết quả Holland chưa
  const { data: result } = await supabase
    .from("holland_results")
    .select("code")
    .eq("user_id", user.id)
    .maybeSingle();

  const hasResult = !!result?.code;

  // 5️⃣ Render Intro với 2 prop hasPaid, hasResult
  return <HollandIntro hasPaid={hasPaid} hasResult={hasResult} />;
}
