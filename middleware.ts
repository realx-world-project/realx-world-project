import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";

const AUTH_LOGIN = "/login";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Skip middleware for NextAuth internals, static assets, and public pages
  if (
    pathname.startsWith("/api/auth/") ||
    pathname.startsWith("/_next/static") ||
    pathname.startsWith("/_next/image") ||
    pathname === "/favicon.ico" ||
    pathname === "/login" ||
    pathname === "/register" ||
    pathname === "/forgot-password" ||
    pathname === "/reset-password" ||
    pathname.startsWith("/home") ||
    pathname.startsWith("/listings")
  ) {
    return NextResponse.next();
  }

  // Route protection — edge-safe: only getToken, no DB or Node built-ins
  if (pathname.startsWith("/admin") || pathname.startsWith("/dashboard")) {
    const token = await getToken({
      req,
      secret: process.env.AUTH_SECRET,
      cookieName: "__Secure-next-auth.session-token",
    });

    if (!token) {
      const loginUrl = new URL(AUTH_LOGIN, req.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (pathname.startsWith("/admin") && token.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
