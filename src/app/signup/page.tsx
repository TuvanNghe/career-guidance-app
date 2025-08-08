"use client";

import { useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createBrowserSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";

export default function SignUpPage() {
  const router = useRouter();
  const params = useSearchParams();
  const redirectTo = params.get("redirectTo") || "/"; // fallback
  const supabase = createBrowserSupabaseClient();
  const redirectedRef = useRef(false);

  useEffect(() => {
    // If already logged in, bounce immediately
    supabase.auth.getSession().then(({ data }) => {
      if (data.session && !redirectedRef.current) {
        redirectedRef.current = true;
        router.replace(redirectTo);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_evt, session) => {
      if (session && !redirectedRef.current) {
        redirectedRef.current = true;
        router.replace(redirectTo);
      }
    });

    return () => subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [redirectTo]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 pt-24">
      <div className="w-full max-w-md bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-4 text-center">Đăng ký / Đăng nhập</h1>
        <Auth
          supabaseClient={supabase}
          providers={["google", "facebook"]}
          magicLink={false}
          socialLayout="horizontal"
          appearance={{
            theme: ThemeSupa,
            variables: { default: { colors: { brand: "#EFD90C", brandAccent: "#FFC40C" } } },
          }}
          localization={{
            lang: "vi",
            variables: { sign_up: { button_label: "Tạo tài khoản" }, sign_in: { button_label: "Đăng nhập" } },
          }}
        />
      </div>
    </div>
  );
}