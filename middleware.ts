// middleware.ts  – gộp cả CLEAN + PAYWALL
import { NextRequest, NextResponse } from "next/server";
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import { STATUS } from "@/lib/constants";

// 🔑 paths yêu cầu đăng nhập + đã thanh toán
export const config = {
  matcher: ["/mbti/:path*", "/holland/:path*", "/knowdell/:path*"],
};

export async function middleware(req: NextRequest) {
  /* ---------- 0.   XÓA COOKIE HỎNG (nếu còn) ---------- */
  const res = NextResponse.next();
  for (const c of req.cookies.getAll()) {
    const v = decodeURIComponent(c.value);
    if (c.name.startsWith("sb-") && (v.startsWith("b_") || !isJson(v))) {
      res.cookies.set({ name: c.name, value: "", path: "/", maxAge: 0 });
    }
  }

  /* ---------- 1.   KIỂM TRA PHIÊN NGƯỜI DÙNG ---------- */
  const supabase = createMiddlewareClient({ req, res });
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return NextResponse.redirect(new URL("/signup", req.url));

  /* ---------- 2.   KIỂM TRA THANH TOÁN ---------- */
  const path = req.nextUrl.pathname.startsWith("/mbti")
      ? "mbti" : req.nextUrl.pathname.startsWith("/holland")
      ? "holland" : "knowdell";

  const { data: payment } = await supabase
      .from("payments").select("id")
      .eq("user_id", session.user.id)
      .eq("product", path)
      .eq("status", STATUS.PAID)
      .maybeSingle();

  if (!payment) return NextResponse.redirect(
      new URL(`/payment?product=${path}`, req.url));

  return res;
}

function isJson(v: string) { try { JSON.parse(v); return true; } catch { return false; } }
