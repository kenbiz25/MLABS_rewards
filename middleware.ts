import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE, SESSION_MAX_AGE_SECONDS } from "@/lib/auth";

// Fine-grained checks (session validity, admin vs employee role) are
// verified server-side by getCurrentUser()/getCurrentAdmin() inside each
// protected page/route, since Prisma/SQLite access isn't available in the
// Edge runtime middleware executes in. This just gates on cookie presence,
// and - since it runs on nearly every request - also keeps the cookie's own
// Max-Age sliding forward so an active signed-in user is never logged out
// mid-use, even though the cookie's expiry is fixed at set-time otherwise.
const PROTECTED_PAGE_PREFIXES = ["/admin/nominations", "/admin/cycles", "/admin/team", "/me"];
const PROTECTED_API_PREFIXES = ["/api/admin", "/api/nominations/mine"];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const sessionCookie = req.cookies.get(SESSION_COOKIE);
  const hasSession = Boolean(sessionCookie?.value);

  const isProtected =
    PROTECTED_PAGE_PREFIXES.some((p) => pathname.startsWith(p)) ||
    PROTECTED_API_PREFIXES.some((p) => pathname.startsWith(p));

  if (isProtected && !hasSession) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.redirect(new URL("/login", req.url));
  }

  const res = NextResponse.next();

  if (sessionCookie?.value) {
    res.cookies.set(SESSION_COOKIE, sessionCookie.value, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: SESSION_MAX_AGE_SECONDS,
    });
  }

  return res;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icon.png).*)"],
};
