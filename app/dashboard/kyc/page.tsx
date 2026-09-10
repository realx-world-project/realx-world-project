import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import KycClient from "./kyc-client";

export default async function KycPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const db: any = prisma;
  const record = await db.kycVerification.findUnique({
    where: { userId: session.user.id as string },
  });

  return <KycClient initialRecord={record} />;
}
