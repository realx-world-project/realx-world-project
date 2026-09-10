import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import EditMaterialListingClient from "./edit-listing-client";

export default async function EditMaterialListingPage({ params }: { params: { id: string } }) {
  const session = await auth();
  if (!session) redirect("/login");

  const { id } = params;
  const db: any = prisma;
  const listing = await db.materialListing.findUnique({
    where: { id },
    include: { vendor: true, images: { orderBy: { createdAt: "asc" } } },
  });

  if (!listing) notFound();
  if (listing.vendor.userId !== (session.user.id as string)) redirect("/dashboard/vendor");

  return <EditMaterialListingClient initialListing={listing} />;
}
