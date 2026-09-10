import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Package, ShieldCheck } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { materialCategoryLabels, formatMaterialPrice } from "@/lib/materials";
import { MaterialFilters } from "@/components/materials/MaterialFilters";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Building Materials Marketplace — RealX World",
  description:
    "Source cement, steel, sand, timber and other building materials from verified vendors across Nigeria.",
};

interface SearchParams {
  category?: string;
  state?: string;
  search?: string;
  page?: string;
}

export default async function MaterialsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const category = params.category ?? null;
  const state = params.state ?? null;
  const search = params.search ?? null;
  const page = Math.max(1, parseInt(params.page ?? "1", 10) || 1);
  const take = 12;
  const skip = (page - 1) * take;

  const where: any = { status: "APPROVED" };
  if (category) where.category = category;
  if (state) where.state = state;
  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
    ];
  }

  const db: any = prisma;
  const [total, items] = await Promise.all([
    db.materialListing.count({ where }),
    db.materialListing.findMany({
      where,
      include: {
        vendor: { select: { businessName: true, state: true, isVerified: true } },
        images: { where: { isPrimary: true }, take: 1 },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take,
    }),
  ]);

  const totalPages = Math.ceil(total / take) || 1;

  const pageHref = (n: number) => {
    const qs = new URLSearchParams();
    if (category) qs.set("category", category);
    if (state) qs.set("state", state);
    if (search) qs.set("search", search);
    qs.set("page", String(n));
    return `/materials?${qs.toString()}`;
  };

  return (
    <div>
      <section className="bg-gradient-to-br from-black to-gray-900 py-16 sm:py-24">
        <div className="container mx-auto px-4 text-center">
          <h1 className="mb-4 text-3xl font-bold text-[#D4AF37] sm:text-5xl">
            Building Materials Marketplace
          </h1>
          <p className="mx-auto max-w-2xl text-base text-gray-300 sm:text-lg">
            Source quality building materials directly from verified vendors across Nigeria
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <MaterialFilters />
        </div>

        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Package className="h-16 w-16 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">No materials found</h3>
            <p className="mt-2 text-center text-muted-foreground">
              Try adjusting your filters to find more materials
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((m: any) => {
              const primaryImage = m.images?.[0]?.url ?? null;
              return (
                <Card key={m.id} className="overflow-hidden border-t-2 border-[#D4AF37]">
                  <div className="relative aspect-[4/3] w-full bg-muted">
                    {primaryImage ? (
                      <Image
                        src={primaryImage}
                        alt={m.title}
                        fill
                        unoptimized
                        className="object-cover"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                    ) : (
                      <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-[#F9F8F4]">
                        <Package className="h-10 w-10 text-[#D4AF37]" />
                        <span className="text-xs text-muted-foreground">No image</span>
                      </div>
                    )}
                  </div>
                  <CardContent className="p-4">
                    <Badge variant="outline" className="mb-2">
                      {materialCategoryLabels[m.category] ?? m.category}
                    </Badge>
                    <h3 className="mb-1 line-clamp-2 text-base font-medium leading-snug">
                      {m.title}
                    </h3>
                    <p className="text-lg font-bold text-[#0A0A0A]">
                      {formatMaterialPrice(m.price)}{" "}
                      <span className="text-sm font-normal text-muted-foreground">/ {m.unit}</span>
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Min order: {m.minOrder} {m.unit}
                      {m.minOrder > 1 ? "s" : ""}
                    </p>
                    <div className="mt-3 flex items-center gap-1 text-sm">
                      <span className="font-medium">{m.vendor?.businessName}</span>
                      {m.vendor?.isVerified && (
                        <ShieldCheck className="h-4 w-4 text-green-600" aria-label="Verified vendor" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">{m.state}</p>
                  </CardContent>
                  <CardFooter className="border-t p-4 pt-3">
                    <Link
                      href={`/materials/${m.id}`}
                      className="w-full rounded-md bg-[#D4AF37] px-4 py-2 text-center text-sm font-semibold text-black transition-colors hover:bg-[#B8961E]"
                    >
                      View Details
                    </Link>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        )}

        {totalPages > 1 && (
          <div className="mt-8 flex items-center justify-center gap-3">
            <Link
              href={pageHref(Math.max(1, page - 1))}
              className={`rounded border px-4 py-2 text-sm ${page <= 1 ? "pointer-events-none opacity-50" : ""}`}
            >
              Previous
            </Link>
            <span className="text-sm text-muted-foreground">
              Page {page} of {totalPages}
            </span>
            <Link
              href={pageHref(Math.min(totalPages, page + 1))}
              className={`rounded border px-4 py-2 text-sm ${page >= totalPages ? "pointer-events-none opacity-50" : ""}`}
            >
              Next
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
