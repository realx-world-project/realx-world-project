import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import type { Session } from "next-auth";
import type { JWT } from "next-auth/jwt";

export const { auth, handlers, signIn, signOut } = NextAuth({
  trustHost: true,
  useSecureCookies: true,

  cookies: {
    sessionToken: {
      name: "__Secure-next-auth.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax" as const,
        path: "/",
        secure: true,
      },
    },
    callbackUrl: {
      name: "__Secure-next-auth.callback-url",
      options: {
        sameSite: "lax" as const,
        path: "/",
        secure: true,
      },
    },
    csrfToken: {
      name: "__Host-next-auth.csrf-token",
      options: {
        httpOnly: true,
        sameSite: "lax" as const,
        path: "/",
        secure: true,
      },
    },
    // state cookie is required by checks: ["state"] on the Google provider
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
  },

  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
      // PKCE disabled — pkce cookies can land on a different Vercel region
      // than the callback, making them unreadable. State-only is sufficient.
      checks: ["state"],
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

  secret: process.env.AUTH_SECRET,
});
