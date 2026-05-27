import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import type { Session } from "next-auth";
import type { JWT } from "next-auth/jwt";

export const { auth, handlers, signIn, signOut } = NextAuth({
  // Required on Vercel / behind any reverse proxy.
  // Also add AUTH_TRUST_HOST=true in Vercel environment variables.
  trustHost: true,

  // OAuth callbacks are top-level browser navigations (not fetch/XHR), so
  // sameSite must be "lax" — not "none". "none" is for cross-origin requests
  // inside iframes/fetch and requires the Partitioned attribute in modern browsers.
  // maxAge: 900 gives a 15-min window so the cookie survives cross-region routing.
  cookies: {
    state: {
      name: "__Secure-next-auth.state",
      options: {
        httpOnly: true,
        sameSite: "lax" as const,
        path: "/",
        secure: true,
        maxAge: 900,
      },
    },
    // Still configure pkceCodeVerifier even though checks: ["state"] disables
    // PKCE — prevents NextAuth from falling back to a default insecure name.
    pkceCodeVerifier: {
      name: "__Secure-next-auth.pkce.code_verifier",
      options: {
        httpOnly: true,
        sameSite: "lax" as const,
        path: "/",
        secure: true,
        maxAge: 900,
      },
    },
    nonce: {
      name: "__Secure-next-auth.nonce",
      options: {
        httpOnly: true,
        sameSite: "lax" as const,
        path: "/",
        secure: true,
      },
    },
  },

  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
      // Disable PKCE — the pkce cookie set during signin can land on a
      // different Vercel region from the callback, making it unreadable.
      // State-only is sufficient CSRF protection for the OAuth flow.
      checks: ["state"],
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        if (!credentials?.email || !credentials.password) return null;

        const email = credentials.email as string;
        const password = credentials.password as string;

        try {
          const user = await prisma.user.findUnique({ where: { email } });
          if (!user || !user.passwordHash) return null;

          const isValid = await compare(password, user.passwordHash);
          if (!isValid) return null;

          await prisma.auditLog.create({
            data: {
              userId: user.id,
              action: "LOGIN",
              entity: "User",
              entityId: user.id,
              meta: {},
            },
          });

          return { id: user.id, email: user.email, name: user.name, role: user.role };
        } catch (err) {
          console.error("[authorize] error:", err);
          return null;
        }
      },
    }),
  ],

  session: {
    strategy: "jwt" as const,
  },

  callbacks: {
    jwt: async ({ token, user }: { token: JWT; user?: any }) => {
      try {
        if (user) {
          token.id = user.id;
          token.role = user.role;
        }
        return token;
      } catch (err) {
        console.error("[jwt callback] error:", err);
        return token;
      }
    },

    session: async ({ session, token }: { session: Session; token: JWT }) => {
      try {
        if (session.user) {
          session.user.id = token.id as string;
          (session.user as any).role = token.role as string;
        }
        return session;
      } catch (err) {
        console.error("[session callback] error:", err);
        return session;
      }
    },
  },

  pages: {
    signIn: "/login",
    error: "/login",
  },

  secret: process.env.NEXTAUTH_SECRET ?? process.env.AUTH_SECRET,
});
