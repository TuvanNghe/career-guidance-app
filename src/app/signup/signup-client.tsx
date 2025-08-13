"use client";

import { useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";

export default function SignupClient() {
  const router = useRouter();
  const sp = useSearchParams();
  const redirectedFrom = sp.get("redirectedFrom") || "/";

  // Supabase client cho Client Component
  const supabase = useMemo(() => createClientComponentClient(), []);

  // Khi login xong (email/password) → quay lại trang trước
  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) router.replace(redirectedFrom);
    });
    return () => {
      // an toàn khi unmount
      data.subscription?.unsubscribe?.();
    };
  }, [supabase, router, redirectedFrom]);

  // URL callback cho OAuth/Magic link (server sẽ xử lý & redirect)
  const redirectTo =
    typeof window !== "undefined"
      ? `${window.location.origin}/auth/callback?redirectedFrom=${encodeURIComponent(
          redirectedFrom
        )}`
      : undefined;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 pt-24">
      <div className="w-full max-w-md bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-4 text-center">
          Đăng ký / Đăng nhập
        </h1>

        <Auth
          supabaseClient={supabase}
          providers={["google", "facebook"]}
          redirectTo={redirectTo}
          magicLink={false} // login bằng user/pass hoặc social
          socialLayout="horizontal"
          appearance={{
            theme: ThemeSupa,
            variables: {
              default: {
                colors: {
                  brand: "#EFD90C", // nút vàng
                  brandAccent: "#FFC40C",
                },
              },
            },
          }}
          localization={{
            lang: "vi",
            variables: {
              sign_up: { button_label: "Tạo tài khoản" },
              sign_in: { button_label: "Đăng nhập" },
            },
          }}
        />
      </div>
    </div>
  );
}
