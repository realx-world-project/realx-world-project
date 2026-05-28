import { getToken } from "next-auth/jwt";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// Created once at module level — not per-request
const globalLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(100, "1 m"),
  analytics: true,
  prefix: "rl:global",
});

const authLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, "1 m"),
  analytics: true,
  prefix: "rl:auth",
});

function getClientIp(req: NextRequest): string {
  // CF-Connecting-IP is the authoritative source when behind Cloudflare
  const cf = req.headers.get("CF-Connecting-IP");
  if (cf) return cf;
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return "unknown";
}

const AUTH_LOGIN = "/login";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Skip middleware entirely for NextAuth routes and public pages
  if (
    pathname.startsWith("/api/auth/") ||
    pathname === "/login" ||
    pathname === "/register" ||
    pathname.startsWith("/home") ||
    pathname.startsWith("/listings")
  ) {
    return NextResponse.next();
  }

  // Skip static assets — no rate limiting needed
  if (
    pathname.startsWith("/_next/static") ||
    pathname.startsWith("/_next/image") ||
    pathname === "/favicon.ico"
  ) {
    return NextResponse.next();
  }

  const ip = getClientIp(req);

  // CLOUDFLARE_ONLY guard — env-flagged so local dev still works
  if (
    process.env.CLOUDFLARE_ONLY === "true" &&
    !req.headers.get("CF-Connecting-IP")
  ) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Global rate limit for all other routes
  try {
    const { success } = await globalLimiter.limit(ip);
    if (!success) {
      return NextResponse.json(
        { error: "Too many requests", retryAfter: 60 },
        { status: 429 }
      );
    }
  } catch (e) {
    console.error("Rate limit check failed:", e);
  }

  // Route protection
  if (pathname.startsWith("/admin") || pathname.startsWith("/dashboard")) {
    // On HTTPS (production) NextAuth sets __Secure-next-auth.session-token.
    // Explicitly naming it here avoids getToken guessing wrong based on the
    // forwarded protocol header, which can differ behind Cloudflare/Vercel.
    const isSecure = req.nextUrl.protocol === "https:";
    const cookieName = isSecure
      ? "__Secure-next-auth.session-token"
      : "next-auth.session-token";

    const token = await getToken({
      req,
      secret: process.env.NEXTAUTH_SECRET ?? process.env.AUTH_SECRET,
      cookieName,
    });

    if (!token) {
      const loginUrl = new URL(AUTH_LOGIN, req.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (pathname.startsWith("/admin") && token.role !== "ADMIN") {
      return NextResponse.redirect(new URL(AUTH_LOGIN, req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match everything except Next.js internals and static files
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
