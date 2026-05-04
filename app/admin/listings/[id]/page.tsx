import { auth } from "@/lib/auth";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { ArrowLeft, MapPin, Calendar, User } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { ImageGallery } from "@/components/listings/ImageGallery";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ModerationSidebar } from "./moderate-actions";

const formatPrice = (n: number) =>
  new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(n);

const typeClasses = {
  SALE: "bg-blue-600 text-white border-transparent",
  RENT: "bg-green-600 text-white border-transparent",
};

const statusVariants = {
  PENDING: "warning",
  APPROVED: "default",
  PUBLISHED: "success",
  REJECTED: "destructive",
} as const;

export default async function AdminListingReviewPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await auth();
  if (!session || (session.user as any).role !== "ADMIN") redirect("/login");

  const base = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || "http://localhost:3000";
  const cookieStore = cookies();
  const cookieHeader = cookieStore.getAll().map((c) => `${c.name}=${c.value}`).join("; ");

  // Fetch listing via public API (admin can access any status)
  let raw: any = null;
  try {
    const res = await fetch(`${base}/api/listings/${params.id}`, {
      headers: { Cookie: cookieHeader },
      cache: "no-store",
    });
    if (res.ok) raw = await res.json();
  } catch {}

  if (!raw) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <h1 className="text-3xl font-bold">Listing Not Found</h1>
        <p className="mt-2 text-muted-foreground">This listing does not exist or has been removed.</p>
        <Link href="/admin/listings" className="mt-6">
          <Button><ArrowLeft className="mr-2 h-4 w-4" />Back to Queue</Button>
        </Link>
      </div>
    );
  }

  // Get full seller info — public API only returns seller name
  const seller = raw.userId
    ? await prisma.user.findUnique({
        where: { id: raw.userId },
        select: { name: true, email: true, role: true, createdAt: true },
      })
    : null;

  const images: string[] = (raw.images ?? [])
    .sort((a: any, b: any) => a.order - b.order)
    .map((img: any) => img.url);

  const location = raw.location;
  const displayAddress = location?.address
    || [location?.area, location?.city, location?.state].filter(Boolean).join(", ");

  return (
    <div className="space-y-6">
      <Link
        href="/admin/listings"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Moderation Queue
      </Link>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main content */}
        <div className="space-y-6 lg:col-span-2">
          <ImageGallery images={images} title={raw.title} />

          <div>
            <div className="mb-3 flex flex-wrap gap-2">
              <Badge className={typeClasses[raw.type as keyof typeof typeClasses]}>
                {raw.type}
              </Badge>
              <Badge variant="outline">{raw.category}</Badge>
              <Badge variant={statusVariants[raw.status as keyof typeof statusVariants] ?? "default"}>
                {raw.status}
              </Badge>
            </div>
            <h1 className="text-3xl font-bold">{raw.title}</h1>
            <div className="mt-2 flex items-center gap-1 text-muted-foreground">
              <MapPin className="h-4 w-4 flex-shrink-0" />
              <span>{displayAddress}</span>
            </div>
          </div>

          <p className="text-3xl font-bold text-primary">
            {formatPrice(raw.price)}
            {raw.type === "RENT" && (
              <span className="ml-1 text-lg font-normal text-muted-foreground">/year</span>
            )}
          </p>

          <Separator />

          <div>
            <h2 className="mb-3 text-xl font-semibold">Description</h2>
            <p className="whitespace-pre-wrap leading-relaxed text-muted-foreground">
              {raw.description}
            </p>
          </div>

          <Separator />

          {/* Seller info */}
          <div>
            <h2 className="mb-3 text-xl font-semibold">Seller Information</h2>
            <Card>
              <CardContent className="flex items-center gap-4 p-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                  <User className="h-6 w-6 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold">{seller?.name ?? raw.user?.name ?? "—"}</p>
                  <p className="text-sm text-muted-foreground">{seller?.email ?? "—"}</p>
                  <div className="mt-1 flex items-center gap-2">
                    {seller?.role && (
                      <Badge variant="outline" className="text-xs">{seller.role}</Badge>
                    )}
                    {seller?.createdAt && (
                      <span className="text-xs text-muted-foreground">
                        Member since {format(new Date(seller.createdAt), "MMMM yyyy")}
                      </span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>Listed on {format(new Date(raw.createdAt), "MMMM d, yyyy")}</span>
          </div>
        </div>

        {/* Action sidebar */}
        <div className="lg:col-span-1">
          <Card className="sticky top-8">
            <CardHeader>
              <CardTitle>Moderation Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <ModerationSidebar listingId={params.id} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
