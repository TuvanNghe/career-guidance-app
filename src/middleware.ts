import { NextRequest, NextResponse } from "next/server";

/**
 * Xoá mọi cookie Supabase hỏng có giá trị bắt đầu bằng "b_" (không phải JSON)
 */
function purgeInvalidSupabaseCookies(req: NextRequest, res: NextResponse) {
  req.cookies.getAll().forEach(({ name, value }) => {
    if (name.startsWith("sb-") && value.startsWith("b_")) {
      res.cookies.set({ name, value: "", path: "/", maxAge: 0 }); // xoá
    }
  });
}

export function middleware(req: NextRequest) {
  const res = NextResponse.next();
  purgeInvalidSupabaseCookies(req, res);
  return res;
}

/* chạy cho mọi đường dẫn, trừ _next/static, images, favicon… */
export const config = {
  matcher: ["/((?!_next/|favicon.ico|images|fonts|robots.txt).*)"],
};
