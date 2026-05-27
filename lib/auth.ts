import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { compare } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import type { Session } from "next-auth";
import type { JWT } from "next-auth/jwt";

export const { auth, handlers, signIn, signOut } = NextAuth({
  trustHost: true,

  // PKCE stores a code_verifier cookie during OAuth initiation.
  // On Vercel, the callback can land on a different edge region than the
  // initiation, so the cookie is gone — producing "pkceCodeVerifier could
  // not be parsed". Dropping PKCE (keeping only state) avoids this entirely.
  // The cookies config below ensures the state cookie also survives cross-
  // region on a custom domain by setting sameSite: "none" + secure: true.
  cookies: {
    pkceCodeVerifier: {
      name: "next-auth.pkce.code_verifier",
      options: {
        httpOnly: true,
        sameSite: "none" as const,
        path: "/",
        secure: true,
      },
    },
    state: {
      name: "next-auth.state",
      options: {
        httpOnly: true,
        sameSite: "none" as const,
        path: "/",
        secure: true,
      },
    },
  },

  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
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
  },

  secret: process.env.NEXTAUTH_SECRET ?? process.env.AUTH_SECRET,
});
