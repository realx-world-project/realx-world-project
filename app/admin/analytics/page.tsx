import { auth } from "@/lib/auth";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Metadata } from "next";
import AnalyticsClient from "./analytics-client";

export const metadata: Metadata = {
  title: "Analytics | RealX Admin",
};

export default async function AdminAnalyticsPage() {
  const session = await auth();
  if (!session || (session.user as any).role !== "ADMIN") redirect("/login");

  const base = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || "http://localhost:3000";
  const cookieStore = cookies();
  const cookieHeader = cookieStore.getAll().map((c) => `${c.name}=${c.value}`).join("; ");

  let initialStats: any = null;

  try {
    const res = await fetch(`${base}/api/admin/stats`, {
      headers: { Cookie: cookieHeader },
      cache: "no-store",
    });
    if (res.ok) initialStats = await res.json();
  } catch {}

  return <AnalyticsClient initialStats={initialStats} />;
}
