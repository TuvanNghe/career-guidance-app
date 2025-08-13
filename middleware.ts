/* -------------------------------------------------------------------------- *
 * Middleware: tự refresh cookie Supabase + chặn trang cần đăng nhập / thanh toán
 * -------------------------------------------------------------------------- */
import { NextRequest, NextResponse } from "next/server";
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import { STATUS } from "@/lib/constants";

export const config = {
  // Bắt tất cả trừ static assets; phần còn lại allowlist bằng code
  matcher: ["/((?!_next|favicon.ico|.*\\.).*)"],
};

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const pathname = req.nextUrl.pathname;

  /* 0) Cho phép đi thẳng các đường public/đặc biệt */
  if (
    pathname.startsWith("/auth") ||      // OAuth callback
    pathname.startsWith("/api") ||       // API (có API cho khách/guest)
    pathname === "/signup"               // trang đăng nhập
  ) {
    return res;
  }

  /* 1) Khởi tạo Supabase và refresh phiên (nếu cần) */
  const supabase = createMiddlewareClient({ req, res });
  const {
    data: { session },
  } = await supabase.auth.getSession();

  /* 2) Nếu CHƯA đăng nhập → đẩy về /signup?redirectTo=<đang đứng ở đâu> */
  if (!session?.user) {
    const url = req.nextUrl.clone();
    url.pathname = "/signup";
    url.searchParams.set(
      "redirectTo",
      pathname + (req.nextUrl.search ? req.nextUrl.search : "")
    );
    return NextResponse.redirect(url);
  }

  /* 3) Nếu đã đăng nhập → kiểm tra quyền truy cập các trang cần thanh toán */
  const user = session.user;
  let product: "mbti" | "holland" | "knowdell" | null = null;
  if (pathname.startsWith("/mbti")) product = "mbti";
  else if (pathname.startsWith("/holland")) product = "holland";
  else if (pathname.startsWith("/knowdell")) product = "knowdell";

  if (product) {
    const { data: payment, error } = await supabase
      .from("payments")
      .select("id")
      .eq("user_id", user.id)
      .eq("product", product)
      .eq("status", STATUS.PAID)
      .maybeSingle();

    if (error) {
      console.error("Middleware payment lookup error:", error);
      return res; // Không chặn UI nếu lỗi DB
    }

    if (!payment) {
      const payUrl = req.nextUrl.clone();
      payUrl.pathname = "/payment";
      payUrl.searchParams.set("product", product);
      return NextResponse.redirect(payUrl);
    }
  }

  /* 4) Cookie Supabase (nếu refresh) đã được attach vào res */
  return res;
}
