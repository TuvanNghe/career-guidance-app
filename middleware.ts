// middleware.ts  (root)
import { NextRequest, NextResponse } from "next/server";
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import { STATUS } from "@/lib/constants";

export const config = {
  matcher: ["/mbti/:path*", "/holland/:path*", "/knowdell/:path*"],
};

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return NextResponse.redirect(new URL("/signup", req.url));

  const product = req.nextUrl.pathname.split("/")[1];      // mbti | holland | knowdell
  const { data } = await supabase
    .from("payments")
    .select("id")
    .eq("user_id", session.user.id)
    .eq("product", product)
    .eq("status", STATUS.PAID)
    .maybeSingle();

  if (!data) return NextResponse.redirect(new URL(`/payment?product=${product}`, req.url));
  return res;
}
