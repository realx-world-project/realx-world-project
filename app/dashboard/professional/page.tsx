import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ProfessionalDashboardClient from "./professional-client";

export default async function ProfessionalDashboardPage() {
  const session = await auth();
  if (!session) redirect("/login");
  const userId = session.user.id as string;

  const db: any = prisma;
  const prof = await db.professional.findUnique({ where: { userId }, include: { credentials: true } });

  return <ProfessionalDashboardClient initialProfessional={prof} />;
}
