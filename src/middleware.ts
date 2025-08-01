import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const res = NextResponse.next();

  // Xoá mọi cookie sb-...-auth-token / refresh-token bắt đầu bằng "b_"
  for (const [name, value] of req.cookies.getAll().entries()) {
    if (name.startsWith("sb-") && value.value.startsWith("b_")) {
      res.cookies.delete(name);                // xoá ở response
    }
  }

  return res;
}

/* chạy cho toàn bộ site */
export const config = { matcher: "/((?!_next|favicon.ico).*)" };
