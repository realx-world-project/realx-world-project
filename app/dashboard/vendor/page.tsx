import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import VendorDashboardClient from "./vendor-client";

export default async function VendorDashboardPage() {
  const session = await auth();
  if (!session) redirect("/login");
  const userId = session.user.id as string;

  const db: any = prisma;
  const vendor = await db.materialVendor.findUnique({
    where: { userId },
    include: { listings: { orderBy: { createdAt: "desc" } } },
  });

  return <VendorDashboardClient initialVendor={vendor} />;
}
