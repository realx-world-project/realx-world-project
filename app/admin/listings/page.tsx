import { auth } from "@/lib/auth";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { Metadata } from "next";
import { format } from "date-fns";
import { House } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow,
} from "@/components/ui/table";
import { TableSkeleton } from "@/components/admin/TableSkeleton";
import {
  Pagination, PaginationContent, PaginationItem,
  PaginationLink, PaginationNext, PaginationPrevious,
} from "@/components/ui/pagination";
import {
  AdminListingFilters,
  ListingActionsCell,
  listingStatusVariants,
  type AdminListingRow,
} from "./listing-client";

function safeFormat(date: string | Date | null | undefined, fmt: string): string {
  try {
    if (!date) return "—";
    const d = new Date(date);
    if (isNaN(d.getTime())) return "—";
    return format(d, fmt);
  } catch {
    return "—";
  }
}

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Listing Moderation | RealX Admin",
};

interface SearchParams {
  status?: string;
  category?: string;
  page?: string;
}

interface AdminListingsPageProps {
  searchParams: Promise<SearchParams>;
}

const formatPrice = (n: number) =>
  new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(n);

function mapRow(raw: any): AdminListingRow {
  return {
    id: raw.id,
    title: raw.title,
    city: raw.location?.city || "",
    state: raw.location?.state || "",
    sellerName: raw.user?.name || "",
    sellerEmail: raw.user?.email || "",
    category: raw.category as string,
    price: raw.price,
    status: raw.status as string,
    imageUrl: raw.images?.[0]?.url ?? null,
    createdAt: raw.createdAt,
  };
}

const LISTINGS_HEADERS = ["Listing", "Seller", "Category", "Price", "Status", "Date", "Actions"];

export default async function AdminListingsPage() {
  const session = await auth();
  if (!session || (session.user as any)?.role !== "ADMIN") {
    redirect("/login");
  }

  try {
    const res = await fetch(
      `${process.env.NEXTAUTH_URL}/api/admin/listings`,
      {
        headers: { Cookie: cookies().toString() },
        cache: "no-store",
      }
    );

    if (!res.ok) {
      const text = await res.text();
      return (
        <div className="p-8">
          <h1 className="text-red-600 font-bold">API Error {res.status}</h1>
          <pre className="mt-4 text-sm bg-red-50 p-4 rounded overflow-auto">
            {text}
          </pre>
        </div>
      );
    }

    const data = await res.json();
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold">Admin Listings (Debug)</h1>
        <p className="mt-2 text-green-600">
          ✓ API returned {data.listings?.length ?? 0} listings successfully
        </p>
        <pre className="mt-4 text-xs bg-gray-50 p-4 rounded overflow-auto max-h-96">
          {JSON.stringify(data, null, 2).slice(0, 2000)}
        </pre>
      </div>
    );
  } catch (err: any) {
    return (
      <div className="p-8">
        <h1 className="text-red-600 font-bold">Render Error</h1>
        <pre className="mt-4 text-sm bg-red-50 p-4 rounded overflow-auto">
          {err?.message ?? String(err)}
          {"\n\n"}
          {err?.stack ?? ""}
        </pre>
      </div>
    );
  }
}
