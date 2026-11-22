import { NextResponse, type NextRequest } from "next/server";
import { verifySession } from "@/server/session";
import { SESSION_COOKIE } from "@/lib/constants";

// Himoyalangan bo‘limlar: kirish talab qilinadi. Rol tekshiruvi sahifa/API darajasida.
const PROTECTED = ["/profil", "/buyurtmalar", "/buyurtma", "/xabarlar", "/tolov", "/usta", "/admin"];

export async function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  if (!PROTECTED.some((p) => pathname === p || pathname.startsWith(p + "/"))) return NextResponse.next();
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  const session = token ? await verifySession(token) : null;
  if (!session) {
    const url = req.nextUrl.clone();
    url.pathname = "/kirish";
    url.search = `?next=${encodeURIComponent(pathname + search)}`;
    const res = NextResponse.redirect(url);
    if (token) res.cookies.delete(SESSION_COOKIE);
    return res;
  }
  if (pathname.startsWith("/admin") && session.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/", req.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/profil/:path*", "/buyurtmalar/:path*", "/buyurtma/:path*", "/xabarlar/:path*", "/tolov/:path*", "/usta/:path*", "/admin/:path*"],
};
