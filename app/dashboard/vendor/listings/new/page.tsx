import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import NewMaterialListingClient from "./new-listing-client";

export default async function NewMaterialListingPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const db: any = prisma;
  const vendor = await db.materialVendor.findUnique({ where: { userId: session.user.id as string } });

  if (!vendor || vendor.status !== "APPROVED") {
    return (
      <div className="mx-auto max-w-lg p-6 text-center">
        <h1 className="text-2xl font-bold">Vendor approval required</h1>
        <p className="mt-2 text-muted-foreground">
          {vendor
            ? "Your vendor account must be approved before you can add listings."
            : "Register as a vendor before you can add listings."}
        </p>
        <Link href="/dashboard/vendor" className="mt-6 inline-block">
          <Button className="bg-[#D4AF37] text-black hover:bg-[#D4AF37]/90">
            Go to Vendor Dashboard
          </Button>
        </Link>
      </div>
    );
  }

  return <NewMaterialListingClient />;
}
