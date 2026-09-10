import Link from "next/link";
import Image from "next/image";
import { ShieldCheck, Store, Phone, Mail, MessageCircle, Package } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { materialCategoryLabels, formatMaterialPrice } from "@/lib/materials";

export const dynamic = "force-dynamic";

export default async function VendorProfilePage({ params }: { params: { id: string } }) {
  const { id } = params;
  const db: any = prisma;

  const vendor = await db.materialVendor.findUnique({
    where: { id },
    include: {
      listings: {
        where: { status: "APPROVED" },
        include: { images: { where: { isPrimary: true }, take: 1 } },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!vendor || vendor.status !== "APPROVED") {
    return (
      <div className="mx-auto max-w-3xl p-8">
        <Link href="/vendors" className="text-sm text-[#D4AF37]">
          ← Back to Vendors
        </Link>
        <h2 className="mt-6 text-2xl font-semibold">Vendor not found</h2>
        <p className="mt-2 text-muted-foreground">
          The requested vendor profile could not be found.
        </p>
      </div>
    );
  }

  const waNumber = vendor.whatsapp?.replace(/[^\d]/g, "");

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <Link href="/vendors" className="text-sm text-[#D4AF37]">
        ← Back to Vendors
      </Link>

      <div className="mt-4 rounded-lg border bg-white p-6">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#D4AF37] text-black">
              <Store className="h-8 w-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold">{vendor.businessName}</h1>
                {vendor.isVerified && (
                  <ShieldCheck className="h-5 w-5 text-green-600" aria-label="Verified vendor" />
                )}
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{vendor.address}, {vendor.state}</p>
            </div>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <a href={`tel:${vendor.phone}`}>
              <Button className="bg-[#D4AF37] text-black hover:bg-[#B8961E]">
                <Phone className="mr-2 h-4 w-4" />
                {vendor.phone}
              </Button>
            </a>
            {waNumber && (
              <a href={`https://wa.me/${waNumber}`} target="_blank" rel="noopener noreferrer">
                <Button variant="outline">
                  <MessageCircle className="mr-2 h-4 w-4" />
                  WhatsApp
                </Button>
              </a>
            )}
            {vendor.email && (
              <a href={`mailto:${vendor.email}`}>
                <Button variant="outline">
                  <Mail className="mr-2 h-4 w-4" />
                  Email
                </Button>
              </a>
            )}
          </div>
        </div>

        <p className="mt-6 whitespace-pre-wrap text-sm text-muted-foreground">
          {vendor.description}
        </p>
      </div>

      <h2 className="mb-4 mt-10 text-xl font-semibold">
        Listings ({vendor.listings.length})
      </h2>

      {vendor.listings.length === 0 ? (
        <p className="text-sm text-muted-foreground">This vendor has no active listings yet.</p>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {vendor.listings.map((m: any) => {
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
                  <h3 className="mb-1 line-clamp-2 text-base font-medium leading-snug">{m.title}</h3>
                  <p className="text-lg font-bold text-[#0A0A0A]">
                    {formatMaterialPrice(m.price)}{" "}
                    <span className="text-sm font-normal text-muted-foreground">/ {m.unit}</span>
                  </p>
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
    </div>
  );
}
