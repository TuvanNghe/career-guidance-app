import { NextRequest, NextResponse } from "next/server";
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import { STATUS } from "@/lib/constants";

/* ────────────────────────────────────────────────────────────── *
 * 1.  MIDDLEWARE chạy cho TẤT CẢ request                        *
 *     – dọn cookie Supabase lỗi (giá trị không phải JSON)       *
 * 2.  Nếu URL thuộc gói thu phí, kiểm tra phiên & thanh toán    *
 * ────────────────────────────────────────────────────────────── */

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();

  /* ---------- 0.   XÓA COOKIE SUPABASE HỎNG ---------- */
  for (const { name, value } of req.cookies.getAll()) {
    const val = decodeURIComponent(value);
    if (name.startsWith("sb-") && !isValidJson(val)) {
      res.cookies.set({ name, value: "", path: "/", maxAge: 0 }); // xoá
    }
  }

  /* ---------- 1.   CHỈ ÁP DỤNG PAYWALL KHI CẦN ---------- */
  const { pathname } = req.nextUrl;
  const isProtected =
    pathname.startsWith("/mbti") ||
    pathname.startsWith("/holland") ||
    pathname.startsWith("/knowdell");

  if (!isProtected) return res;          // 🔚 trang miễn phí → thoát sớm

  /* ---------- 2.   KIỂM TRA PHIÊN NGƯỜI DÙNG ---------- */
  const supabase = createMiddlewareClient({ req, res });
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.redirect(new URL("/signup", req.url));
  }

  /* ---------- 3.   KIỂM TRA THANH TOÁN ---------- */
  const product = pathname.startsWith("/mbti")
    ? "mbti"
    : pathname.startsWith("/holland")
    ? "holland"
    : "knowdell";

  const { data: payment } = await supabase
    .from("payments")
    .select("id")
    .eq("user_id", session.user.id)
    .eq("product", product)
    .eq("status", STATUS.PAID)
    .maybeSingle();

  if (!payment) {
    return NextResponse.redirect(
      new URL(`/payment?product=${product}`, req.url),
    );
  }

  /* ---------- 4.   ĐÃ ĐỦ ĐIỀU KIỆN ---------- */
  return res;
}

/* Chạy middleware cho **mọi** đường dẫn (trừ assets tĩnh) */
export const config = {
  matcher: ["/((?!_next/|favicon.ico|images|fonts).*)"],
};

/* ---------- helper ---------- */
function isValidJson(v: string) {
  try {
    JSON.parse(v);
    return true;
  } catch {
    return false;
  }
}
