import { Metadata } from "next";
import Link from "next/link";
import { ShieldCheck, Store } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { VendorFilters } from "@/components/materials/VendorFilters";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Building Material Vendors — RealX World",
  description: "Browse verified building material vendors across Nigeria.",
};

interface SearchParams {
  state?: string;
  search?: string;
  page?: string;
}

export default async function VendorsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const state = params.state ?? null;
  const search = params.search ?? null;
  const page = Math.max(1, parseInt(params.page ?? "1", 10) || 1);
  const take = 12;
  const skip = (page - 1) * take;

  const where: any = { status: "APPROVED" };
  if (state) where.state = state;
  if (search) {
    where.OR = [
      { businessName: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
    ];
  }

  const db: any = prisma;
  const [total, vendors] = await Promise.all([
    db.materialVendor.count({ where }),
    db.materialVendor.findMany({
      where,
      include: { _count: { select: { listings: { where: { status: "APPROVED" } } } } },
      orderBy: { createdAt: "desc" },
      skip,
      take,
    }),
  ]);

  const totalPages = Math.ceil(total / take) || 1;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 rounded-lg bg-gradient-to-br from-black to-gray-900 p-8 text-white">
        <h1 className="text-3xl font-bold">Building Material Vendors</h1>
        <p className="mt-2 text-gray-300">
          Connect with verified building material suppliers across Nigeria
        </p>
      </div>

      <div className="mb-6">
        <VendorFilters />
      </div>

      {vendors.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16">
          <Store className="h-16 w-16 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">No vendors found</h3>
          <p className="mt-2 text-center text-muted-foreground">
            Try adjusting your filters to find more vendors
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {vendors.map((v: any) => (
            <Card key={v.id} className="border-t-2 border-[#D4AF37]">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#D4AF37] font-semibold text-black">
                    <Store className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-1.5">
                      <h3 className="text-lg font-semibold">{v.businessName}</h3>
                      {v.isVerified && (
                        <ShieldCheck className="h-4 w-4 text-green-600" aria-label="Verified vendor" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{v.state}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="line-clamp-2 text-sm text-muted-foreground">{v.description}</p>
                <p className="mt-3 text-sm font-medium">
                  {v._count.listings} {v._count.listings === 1 ? "listing" : "listings"}
                </p>
                <div className="mt-4">
                  <Link
                    href={`/vendors/${v.id}`}
                    className="inline-block rounded bg-[#D4AF37] px-4 py-2 text-sm font-semibold text-black hover:bg-[#B8961E]"
                  >
                    View Listings
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="mt-8 flex items-center justify-between">
        <div />
        <div className="space-x-2">
          <a
            href={`?page=${Math.max(1, page - 1)}`}
            className={`rounded border px-4 py-2 ${page <= 1 ? "pointer-events-none opacity-50" : ""}`}
          >
            Previous
          </a>
          <span className="px-3">
            {page} / {totalPages}
          </span>
          <a
            href={`?page=${Math.min(totalPages, page + 1)}`}
            className={`rounded border px-4 py-2 ${page >= totalPages ? "pointer-events-none opacity-50" : ""}`}
          >
            Next
          </a>
        </div>
      </div>
    </div>
  );
}
