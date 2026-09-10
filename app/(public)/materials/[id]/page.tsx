import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Phone, Mail, MessageCircle, ShieldCheck } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ImageGallery } from "@/components/listings/ImageGallery";
import { materialCategoryLabels, formatMaterialPrice } from "@/lib/materials";

export const dynamic = "force-dynamic";

interface MaterialDetailPageProps {
  params: Promise<{ id: string }>;
}

async function getMaterial(id: string) {
  const db: any = prisma;
  const listing = await db.materialListing.findUnique({
    where: { id },
    include: {
      vendor: true,
      images: { orderBy: { createdAt: "asc" } },
    },
  });
  if (!listing || listing.status !== "APPROVED") return null;
  return listing;
}

export async function generateMetadata({ params }: MaterialDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const listing = await getMaterial(id);
  if (!listing) return { title: "Listing Not Found | RealX World" };

  return {
    title: `${listing.title} | RealX World Materials`,
    description: listing.description.slice(0, 160).replace(/\n/g, " "),
  };
}

export default async function MaterialDetailPage({ params }: MaterialDetailPageProps) {
  const { id } = await params;
  const listing = await getMaterial(id);

  if (!listing) {
    return (
      <div className="container mx-auto flex flex-col items-center justify-center px-4 py-24 text-center">
        <h1 className="text-3xl font-bold">Listing not found</h1>
        <p className="mt-4 text-muted-foreground">
          This material listing may have been removed or is temporarily unavailable.
        </p>
        <Link href="/materials" className="mt-8">
          <Button>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Marketplace
          </Button>
        </Link>
      </div>
    );
  }

  const waNumber = listing.vendor.whatsapp?.replace(/[^\d]/g, "");

  return (
    <div className="container mx-auto px-4 py-8">
      <Link
        href="/materials"
        className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Marketplace
      </Link>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ImageGallery images={listing.images.map((img: any) => img.url)} title={listing.title} />

          <div className="mt-8 space-y-6">
            <div>
              <div className="mb-3 flex flex-wrap gap-2">
                <Badge variant="outline">
                  {materialCategoryLabels[listing.category] ?? listing.category}
                </Badge>
              </div>
              <h1 className="text-2xl font-bold sm:text-3xl">{listing.title}</h1>
            </div>

            <p className="text-2xl font-bold text-[#D4AF37] sm:text-3xl">
              {formatMaterialPrice(listing.price)}{" "}
              <span className="text-lg font-normal text-muted-foreground">/ {listing.unit}</span>
            </p>
            <p className="text-sm text-muted-foreground">
              Minimum order: {listing.minOrder} {listing.unit}
              {listing.minOrder > 1 ? "s" : ""}
            </p>

            <Separator />

            <div>
              <h2 className="mb-3 text-xl font-semibold">Description</h2>
              <div className="whitespace-pre-wrap leading-relaxed text-muted-foreground">
                {listing.description}
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="sticky top-8 space-y-4 rounded-xl border bg-card p-6 shadow-sm">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold">{listing.vendor.businessName}</h2>
                {listing.vendor.isVerified && (
                  <ShieldCheck className="h-5 w-5 text-green-600" aria-label="Verified vendor" />
                )}
              </div>
              <p className="text-sm text-muted-foreground">{listing.vendor.state}</p>
            </div>

            <Separator />

            <h3 className="text-sm font-semibold">Enquire</h3>
            <div className="space-y-2">
              <a href={`tel:${listing.vendor.phone}`} className="block">
                <Button className="w-full bg-[#D4AF37] text-black hover:bg-[#B8961E]">
                  <Phone className="mr-2 h-4 w-4" />
                  {listing.vendor.phone}
                </Button>
              </a>

              {waNumber && (
                <a
                  href={`https://wa.me/${waNumber}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                >
                  <Button variant="outline" className="w-full">
                    <MessageCircle className="mr-2 h-4 w-4" />
                    WhatsApp
                  </Button>
                </a>
              )}

              {listing.vendor.email && (
                <a href={`mailto:${listing.vendor.email}`} className="block">
                  <Button variant="outline" className="w-full">
                    <Mail className="mr-2 h-4 w-4" />
                    {listing.vendor.email}
                  </Button>
                </a>
              )}
            </div>

            <Separator />

            <Link
              href={`/vendors/${listing.vendor.id}`}
              className="block text-center text-sm font-medium text-[#D4AF37] hover:text-[#B8961E]"
            >
              View All Listings from this Vendor
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
