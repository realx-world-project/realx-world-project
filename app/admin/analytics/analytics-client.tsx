"use client";

import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Users, Home, Briefcase, MessageSquare } from "lucide-react";
import { StatCard } from "@/components/admin/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type Period = "7d" | "30d" | "90d" | "12m";

interface AnalyticsData {
  listingsByDay: { date: string; count: number }[];
  usersByDay: { date: string; count: number }[];
  listingsByType: { type: string; count: number }[];
  listingsByCategory: { category: string; count: number }[];
  listingsByState: { state: string; count: number }[];
  revenueByDay: { date: string; amount: number }[];
}

const periodLabels: Record<Period, string> = {
  "7d": "7D",
  "30d": "30D",
  "90d": "90D",
  "12m": "12M",
};

const sumCounts = (arr: { count: number }[] | undefined) =>
  (arr ?? []).reduce((sum, x) => sum + x.count, 0);

const findCount = (arr: { status?: string; count: number }[] | undefined, status: string) =>
  (arr ?? []).find((x) => x.status === status)?.count ?? 0;

const typeColors: Record<string, string> = { SALE: "#D4AF37", RENT: "#0A0A0A" };
const roleColors: Record<string, string> = { ADMIN: "#DC2626", SELLER: "#D4AF37", BUYER: "#9CA3AF" };
const kycColors: Record<string, string> = {
  NOT_SUBMITTED: "#9CA3AF",
  PENDING: "#F59E0B",
  VERIFIED: "#16A34A",
  FAILED: "#DC2626",
};

const formatAmount = (amount: number) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(amount);

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-72 w-full">{children}</div>
      </CardContent>
    </Card>
  );
}

function ChartSkeleton() {
  return <Skeleton className="h-72 w-full" />;
}

export default function AnalyticsClient({ initialStats }: { initialStats: any }) {
  const stats = initialStats ?? {};
  const [period, setPeriod] = useState<Period>("30d");
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch(`/api/admin/analytics?period=${period}`)
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) setAnalytics(data);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [period]);

  const totalListings = sumCounts(stats.listingsByStatus);
  const totalProfessionals = sumCounts(stats.professionalsByStatus);
  const hasKyc = (stats.kycByStatus ?? []).length > 0;
  const hasRevenue = (stats.paymentsByStatusType ?? []).some(
    (p: any) => p.status === "SUCCESS" && p.count > 0
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">Analytics</h1>
          <p className="mt-1 text-muted-foreground">Platform performance overview</p>
        </div>
        <Tabs value={period} onValueChange={(v) => setPeriod(v as Period)}>
          <TabsList>
            {(Object.keys(periodLabels) as Period[]).map((p) => (
              <TabsTrigger key={p} value={p}>
                {periodLabels[p]}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {/* Section 1: Key Metrics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Users" value={stats.totalUsers ?? 0} icon={<Users className="h-10 w-10" />} color="blue" />
        <StatCard title="Total Listings" value={totalListings} icon={<Home className="h-10 w-10" />} color="yellow" />
        <StatCard title="Total Professionals" value={totalProfessionals} icon={<Briefcase className="h-10 w-10" />} color="green" />
        <StatCard title="Total Enquiries" value={stats.enquiriesCount ?? 0} icon={<MessageSquare className="h-10 w-10" />} color="red" />
      </div>

      {/* Section 2: Growth Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <ChartCard title="Listings Growth">
          {loading || !analytics ? (
            <ChartSkeleton />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analytics.listingsByDay}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="#D4AF37" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard title="User Growth">
          {loading || !analytics ? (
            <ChartSkeleton />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analytics.usersByDay}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="#0A0A0A" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      </div>

      {/* Section 3: Distribution Charts */}
      <div className="grid gap-6 lg:grid-cols-3">
        <ChartCard title="Listings by Type">
          {loading || !analytics ? (
            <ChartSkeleton />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={analytics.listingsByType}
                  dataKey="count"
                  nameKey="type"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label
                >
                  {analytics.listingsByType.map((entry, i) => (
                    <Cell key={i} fill={typeColors[entry.type] ?? "#9CA3AF"} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard title="Listings by Category">
          {loading || !analytics ? (
            <ChartSkeleton />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.listingsByCategory} layout="vertical" margin={{ left: 16 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" allowDecimals={false} />
                <YAxis dataKey="category" type="category" tick={{ fontSize: 11 }} width={90} />
                <Tooltip />
                <Bar dataKey="count" fill="#D4AF37" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard title="Top States">
          {loading || !analytics ? (
            <ChartSkeleton />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.listingsByState} layout="vertical" margin={{ left: 16 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" allowDecimals={false} />
                <YAxis dataKey="state" type="category" tick={{ fontSize: 11 }} width={90} />
                <Tooltip />
                <Bar dataKey="count" fill="#0A0A0A" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      </div>

      {/* Section 4: Platform Health */}
      <div className="grid gap-6 lg:grid-cols-2">
        <ChartCard title="Users by Role">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={stats.usersByRole ?? []}
                dataKey="count"
                nameKey="role"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label
              >
                {(stats.usersByRole ?? []).map((entry: any, i: number) => (
                  <Cell key={i} fill={roleColors[entry.role] ?? "#9CA3AF"} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        {hasKyc && (
          <ChartCard title="KYC Verification Status">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.kycByStatus ?? []}
                  dataKey="count"
                  nameKey="status"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label
                >
                  {(stats.kycByStatus ?? []).map((entry: any, i: number) => (
                    <Cell key={i} fill={kycColors[entry.status] ?? "#9CA3AF"} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>
        )}
      </div>

      {/* Section 5: Revenue */}
      {hasRevenue && (
        <ChartCard title="Revenue (₦)">
          {loading || !analytics ? (
            <ChartSkeleton />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analytics.revenueByDay}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tickFormatter={(v) => formatAmount(v)} width={90} />
                <Tooltip formatter={(v: any) => formatAmount(Number(v))} />
                <Line type="monotone" dataKey="amount" stroke="#16a34a" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      )}

      {/* Section 6: Quick Stats Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Quick Stats</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Metric</TableHead>
                <TableHead className="text-right">Count</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[
                ["Pending Listings", findCount(stats.listingsByStatus, "PENDING")],
                ["Approved Listings", findCount(stats.listingsByStatus, "APPROVED")],
                ["Rejected Listings", findCount(stats.listingsByStatus, "REJECTED")],
                ["Pending Professionals", findCount(stats.professionalsByStatus, "PENDING")],
                ["Approved Professionals", findCount(stats.professionalsByStatus, "APPROVED")],
                ["Pending KYC", findCount(stats.kycByStatus, "PENDING")],
                ["Verified KYC", findCount(stats.kycByStatus, "VERIFIED")],
                ["Saved Listings", stats.savedListingsCount ?? 0],
                ["Total Enquiries", stats.enquiriesCount ?? 0],
                ["Pending Reports", stats.pendingReports ?? 0],
              ].map(([label, value]) => (
                <TableRow key={label as string}>
                  <TableCell className="font-medium">{label}</TableCell>
                  <TableCell className="text-right tabular-nums">{value}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
