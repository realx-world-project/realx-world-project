import { Metadata } from "next";
import Link from "next/link";
import { format } from "date-fns";
import { Users, Clock, CheckCircle, Flag, ArrowRight } from "lucide-react";
import { StatCard } from "@/components/admin/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Admin Dashboard | Relex World",
};

// ── Mock data ──────────────────────────────────────────────────────────────

const mockStats = {
  totalUsers: 124,
  pendingListings: 8,
  publishedListings: 56,
  openReports: 3,
};

const mockActivity = [
  { id: "1", action: "LISTING_CREATED", userEmail: "ada@example.com", entity: "Listing", entityId: "lst_1", createdAt: "2026-04-27T10:30:00Z" },
  { id: "2", action: "LISTING_APPROVED", userEmail: "admin@realx.ng", entity: "Listing", entityId: "lst_2", createdAt: "2026-04-27T09:15:00Z" },
  { id: "3", action: "USER_REGISTERED", userEmail: "emeka@example.com", entity: "User", entityId: "usr_3", createdAt: "2026-04-27T08:00:00Z" },
  { id: "4", action: "REPORT_SUBMITTED", userEmail: "bola@example.com", entity: "Report", entityId: "rep_1", createdAt: "2026-04-26T22:45:00Z" },
  { id: "5", action: "LOGIN", userEmail: "admin@realx.ng", entity: "User", entityId: "usr_1", createdAt: "2026-04-26T20:00:00Z" },
];

// ── Fetch (falls back to mock) ──────────────────────────────────────────────

async function fetchStats() {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/api/admin/stats`,
      { cache: "no-store" }
    );
    if (!res.ok) throw new Error();
    return res.json();
  } catch {
    return mockStats;
  }
}

// ── Page ───────────────────────────────────────────────────────────────────

export default async function AdminDashboardPage() {
  const stats = await fetchStats();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="mt-1 text-muted-foreground">Overview of platform activity</p>
      </div>

      {/* Stats grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Users"
          value={stats.totalUsers ?? mockStats.totalUsers}
          icon={<Users className="h-10 w-10" />}
          color="blue"
        />
        <StatCard
          title="Pending Listings"
          value={stats.pendingListings ?? mockStats.pendingListings}
          icon={<Clock className="h-10 w-10" />}
          color="yellow"
        />
        <StatCard
          title="Published Listings"
          value={stats.publishedListings ?? mockStats.publishedListings}
          icon={<CheckCircle className="h-10 w-10" />}
          color="green"
        />
        <StatCard
          title="Open Reports"
          value={stats.openReports ?? mockStats.openReports}
          icon={<Flag className="h-10 w-10" />}
          color="red"
        />
      </div>

      {/* Activity + Quick actions */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {mockActivity.map((entry) => (
              <div key={entry.id} className="flex items-center justify-between gap-4 text-sm">
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="shrink-0 font-mono text-xs">
                    {entry.action}
                  </Badge>
                  <span className="truncate text-muted-foreground">{entry.userEmail}</span>
                </div>
                <time className="shrink-0 text-xs text-muted-foreground">
                  {format(new Date(entry.createdAt), "MMM d, HH:mm")}
                </time>
              </div>
            ))}
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
