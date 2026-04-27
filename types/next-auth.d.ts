import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role: "ADMIN" | "AGENT" | "SELLER" | "BUYER";
    };
  }

  interface User {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role: "ADMIN" | "AGENT" | "SELLER" | "BUYER";
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: "ADMIN" | "AGENT" | "SELLER" | "BUYER";
  }
}