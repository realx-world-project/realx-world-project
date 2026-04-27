import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import type { Session } from "next-auth";
import type { JWT } from "next-auth/jwt";

const config = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        if (!credentials?.email || !credentials.password) {
          throw new Error("Email and password are required");
        }

        const email = credentials.email as string;
        const password = credentials.password as string;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || !user.passwordHash) {
          throw new Error("Invalid credentials");
        }

        const isValid = await compare(password, user.passwordHash);
        if (!isValid) {
          throw new Error("Invalid credentials");
        }

        await prisma.auditLog.create({
          data: {
            userId: user.id,
            action: "LOGIN",
            entity: "User",
            entityId: user.id,
            meta: {},
          },
        });

        return user;
      },
    }),
  ],
  session: {
    strategy: "jwt" as const,
  },
  callbacks: {
    jwt: async ({ token, user }: { token: JWT, user?: any }) => {
      if (user) {
        return {
          ...token,
          id: user.id,
          role: user.role,
        };
      }
      return token;
    },
    session: async ({ session, token }: { session: Session, token: JWT }) => {
      if (session.user) {
        session.user.id = token.id as string;
        (session.user as any).role = token.role as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export const { auth, handlers } = NextAuth(config);

export default config;
