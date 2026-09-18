"use client";

import { Suspense, useEffect, useState, type ReactNode } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { format } from "date-fns";
import { ArrowLeft, Home, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { clearCompare, removeFromCompare } from "@/lib/comparison-store";

interface CompareListing {
  id: string;
  title: string;
  price: number;
  type: string;
  category: string;
  status: string;
  leaseDuration: string | null;
  location: { city: string; state: string; address: string } | null;
  images: string[];
  createdAt: string;
}

const typeLabels: Record<string, string> = {
  SALE: "For Sale",
  SHORT_TERM: "Short-Term",
  MONTHLY: "Monthly",
  ANNUAL: "Annual",
  LONG_TERM: "Long-Term",
};

const categoryLabels: Record<string, string> = {
  RESIDENTIAL: "Residential",
  COMMERCIAL: "Commercial",
  LAND: "Land",
};

const statusVariants: Record<string, "warning" | "default" | "success" | "destructive"> = {
  PENDING: "warning",
  APPROVED: "default",
  PUBLISHED: "success",
  REJECTED: "destructive",
};

const formatPrice = (price: number) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(price);

function ComparisonSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="mt-2 h-5 w-48" />
      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ))}
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="container mx-auto flex flex-col items-center justify-center px-4 py-24 text-center">
      <h1 className="text-2xl font-bold">Select at least 2 properties to compare</h1>
      <p className="mt-2 text-muted-foreground">
        Add properties to your comparison tray from the listings page, then come back here.
      </p>
      <Link href="/listings" className="mt-6">
        <Button className="bg-[#D4AF37] text-black hover:bg-[#D4AF37]/90">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Listings
        </Button>
      </Link>
    </div>
  );
}

function CompareContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const idsParam = searchParams.get("ids") ?? "";
  const ids = idsParam.split(",").map((s) => s.trim()).filter(Boolean);

  const [listings, setListings] = useState<CompareListing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (ids.length < 2) {
      setLoading(false);
      return;
    }
    setLoading(true);
    fetch(`/api/listings/compare?ids=${ids.join(",")}`)
      .then((res) => res.json())
      .then((data) => setListings(Array.isArray(data) ? data : []))
      .catch(() => setListings([]))
      .finally(() => setLoading(false));
  }, [idsParam]);

  const handleRemove = (id: string) => {
    removeFromCompare(id);
    window.dispatchEvent(new Event("compareUpdated"));
    const remaining = ids.filter((i) => i !== id);
    if (remaining.length < 2) {
      router.push("/listings");
    } else {
      router.push(`/compare?ids=${remaining.join(",")}`);
    }
  };

  const handleClearComparison = () => {
    clearCompare();
    window.dispatchEvent(new Event("compareUpdated"));
    router.push("/listings");
  };

  if (ids.length < 2) return <EmptyState />;
  if (loading) return <ComparisonSkeleton />;
  if (listings.length < 2) return <EmptyState />;

  const rows: { label: string; raw: (l: CompareListing) => string; render: (l: CompareListing) => ReactNode }[] = [
    {
      label: "Price",
      raw: (l) => `${l.price}|${l.leaseDuration ?? ""}`,
      render: (l) => (
        <span>
          {formatPrice(l.price)}
          {l.leaseDuration && <span className="text-muted-foreground"> / {l.leaseDuration}</span>}
        </span>
      ),
    },
    {
      label: "Listing Type",
      raw: (l) => l.type,
      render: (l) => typeLabels[l.type] ?? l.type,
    },
    {
      label: "Category",
      raw: (l) => l.category,
      render: (l) => categoryLabels[l.category] ?? l.category,
    },
    {
      label: "Location",
      raw: (l) => `${l.location?.city ?? ""}, ${l.location?.state ?? ""}`,
      render: (l) => `${l.location?.city ?? "—"}, ${l.location?.state ?? ""}`,
    },
    {
      label: "Status",
      raw: (l) => l.status,
      render: (l) => <Badge variant={statusVariants[l.status] ?? "default"}>{l.status}</Badge>,
    },
    {
      label: "Listed",
      raw: (l) => l.createdAt,
      render: (l) => format(new Date(l.createdAt), "MMM d, yyyy"),
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8 pb-24">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">Property Comparison</h1>
          <p className="mt-1 text-muted-foreground">Comparing {listings.length} properties</p>
        </div>
        <div className="flex gap-2">
          <Link href="/listings">
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Listings
            </Button>
          </Link>
          <Button variant="outline" size="sm" onClick={handleClearComparison} className="text-destructive">
            Clear Comparison
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border">
        <Table>
          <TableBody>
            {/* Row 0 — images, titles, actions */}
            <TableRow className="bg-white hover:bg-white">
              <TableCell className="sticky left-0 z-10 w-32 bg-white font-medium text-gray-600">
                Property
              </TableCell>
              {listings.map((l) => (
                <TableCell key={l.id} className="text-center align-top">
                  <div className="mx-auto w-48">
                    <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg bg-muted">
                      {l.images?.[0] ? (
                        <Image src={l.images[0]} alt={l.title} fill unoptimized className="object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <Home className="h-10 w-10 text-muted-foreground/50" />
                        </div>
                      )}
                    </div>
                    <p className="mt-2 line-clamp-2 font-bold">{l.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {l.location?.city}, {l.location?.state}
                    </p>
                    <div className="mt-3 flex flex-col gap-2">
                      <Link href={`/listings/${l.id}`}>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-black"
                        >
                          View Listing
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRemove(l.id)}
                        className="w-full border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700"
                      >
                        <X className="mr-1 h-3 w-3" />
                        Remove
                      </Button>
                    </div>
                  </div>
                </TableCell>
              ))}
            </TableRow>

            {rows.map((row, i) => {
              const values = listings.map((l) => row.raw(l));
              const differs = new Set(values).size > 1;
              const zebra = i % 2 === 0 ? "bg-gray-50" : "bg-white";
              return (
                <TableRow key={row.label} className={cn(zebra, "hover:bg-inherit")}>
                  <TableCell
                    className={cn(
                      "sticky left-0 z-10 w-32 font-medium text-gray-600",
                      zebra,
                      differs && "border-l-4 border-l-amber-400"
                    )}
                  >
                    {row.label}
                  </TableCell>
                  {listings.map((l) => (
                    <TableCell key={l.id} className="text-center">
                      {row.render(l)}
                    </TableCell>
                  ))}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

export default function ComparePage() {
  return (
    <Suspense fallback={<ComparisonSkeleton />}>
      <CompareContent />
    </Suspense>
  );
}
