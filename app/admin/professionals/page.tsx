import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ProfessionalsTable from "@/components/admin/ProfessionalsTable";

export default async function AdminProfessionalsPage({ searchParams }: { searchParams?: any }) {
  const session = await auth();
  if (!session || (session.user as any).role !== "ADMIN") redirect("/login");

  const status = searchParams?.status ?? undefined;

  const where: any = {};
  if (status) where.status = status;

  const db: any = prisma;
  const [items, counts] = await Promise.all([
    db.professional.findMany({ where, include: { user: true }, orderBy: { createdAt: "desc" } }),
    db.professional.groupBy({ by: ["status"], _count: { _all: true } }),
  ]);

  const countMap: Record<string, number> = {};
  counts.forEach((c:any)=> countMap[c.status] = c._count._all ?? 0);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-semibold">Professionals Management</h1>
      <div className="mt-4">
        <ProfessionalsTable initialItems={items} counts={countMap} />
      </div>
    </div>
  );
}
