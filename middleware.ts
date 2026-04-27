import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const AUTH_LOGIN = "/auth/login";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/_next") || pathname.startsWith("/static") || pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  const session = await auth();

  if (pathname.startsWith("/admin")) {
    if (!session?.user) {
      return NextResponse.redirect(new URL(AUTH_LOGIN, req.url));
    }
    if ((session.user as any).role !== "ADMIN") {
      return NextResponse.redirect(new URL(AUTH_LOGIN, req.url));
    }
    return NextResponse.next();
  }

  if (pathname.startsWith("/dashboard")) {
    if (!session?.user) {
      return NextResponse.redirect(new URL(AUTH_LOGIN, req.url));
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/dashboard/:path*"],
};
