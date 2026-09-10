import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import NewListingClient from "./new-listing-client";

export default async function CreateListingPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const role = (session.user as any).role as string;

  if (role === "SELLER") {
    const db: any = prisma;
    const user = await db.user.findUnique({
      where: { id: session.user.id as string },
      select: { kycStatus: true },
    });

    if (user?.kycStatus !== "VERIFIED") {
      redirect("/dashboard/kyc?message=verify-required");
    }
  }

  return <NewListingClient />;
}
