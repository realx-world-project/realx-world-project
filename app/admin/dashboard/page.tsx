import { auth } from "@/lib/auth";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Metadata } from "next";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Users, Clock, CheckCircle, Flag, ArrowRight } from "lucide-react";
import { StatCard } from "@/components/admin/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Admin Dashboard | RealX World",
};

interface AuditLogEntry {
  id: string;
  action: string;
  entity: string;
  entityId: string;
  meta: Record<string, unknown>;
  createdAt: string;
  user: { email: string };
}

interface StatsResponse {
  totalUsers: number;
  listingsByStatus: { status: string; count: number }[];
  pendingReports: number;
  recentAuditLogs: AuditLogEntry[];
}

export default async function AdminDashboardPage() {
  const session = await auth();
  if (!session || (session.user as any).role !== "ADMIN") redirect("/login");

  const base = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || "http://localhost:3000";
  const cookieStore = cookies();
  const cookieHeader = cookieStore.getAll().map((c) => `${c.name}=${c.value}`).join("; ");

  let totalUsers = 0;
  let pendingListings = 0;
  let publishedListings = 0;
  let openReports = 0;
  let recentActivity: AuditLogEntry[] = [];

  try {
    const res = await fetch(`${base}/api/admin/stats`, {
      headers: { Cookie: cookieHeader },
      cache: "no-store",
    });
    if (res.ok) {
      const stats: StatsResponse = await res.json();
      totalUsers = stats.totalUsers ?? 0;
      pendingListings = stats.listingsByStatus?.find((l) => l.status === "PENDING")?.count ?? 0;
      publishedListings = stats.listingsByStatus?.find((l) => l.status === "PUBLISHED")?.count ?? 0;
      openReports = stats.pendingReports ?? 0;
      recentActivity = stats.recentAuditLogs ?? [];
    }
  } catch {}

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold sm:text-3xl">Admin Dashboard</h1>
        <p className="mt-1 text-muted-foreground">Overview of platform activity</p>
      </div>

      {/* Stats grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Users" value={totalUsers} icon={<Users className="h-10 w-10" />} color="blue" />
        <StatCard title="Pending Listings" value={pendingListings} icon={<Clock className="h-10 w-10" />} color="yellow" />
        <StatCard title="Published Listings" value={publishedListings} icon={<CheckCircle className="h-10 w-10" />} color="green" />
        <StatCard title="Open Reports" value={openReports} icon={<Flag className="h-10 w-10" />} color="red" />
      </div>

      {/* Activity + Quick actions */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentActivity.length === 0 ? (
              <p className="text-sm text-muted-foreground">No recent activity.</p>
            ) : (
              recentActivity.slice(0, 8).map((entry) => (
                <div key={entry.id} className="flex items-center justify-between gap-4 text-sm">
                  <div className="flex items-center gap-3 min-w-0">
                    <Badge variant="outline" className="shrink-0 font-mono text-xs">
                      {entry.action}
                    </Badge>
                    <span className="truncate text-muted-foreground">{entry.user?.email}</span>
                  </div>
                  <time className="shrink-0 text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(entry.createdAt), { addSuffix: true })}
                  </time>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Quick actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/admin/listings" className="block">
              <Button variant="outline" className="w-full justify-between">
                Go to Moderation Queue
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/admin/users" className="block">
              <Button variant="outline" className="w-full justify-between">
                Manage Users
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/admin/reports" className="block">
              <Button variant="outline" className="w-full justify-between">
                View Reports
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/admin/audit" className="block">
              <Button variant="outline" className="w-full justify-between">
                Audit Log
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
