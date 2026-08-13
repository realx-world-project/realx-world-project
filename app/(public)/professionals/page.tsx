import React from "react";
import { prisma } from "@/lib/prisma";
import ProfessionalFilters from "@/components/professionals/ProfessionalFilters";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import Link from "next/link";

export const metadata = {
  title: "Professionals Directory — RealX World",
  description: "Find verified surveyors, architects, engineers and real estate professionals in Nigeria.",
};

export default async function ProfessionalsPage({ searchParams }: { searchParams: any }) {
  const category = searchParams?.category ?? null;
  const state = searchParams?.state ?? null;
  const search = searchParams?.search ?? null;
  const page = parseInt(searchParams?.page ?? "1", 10) || 1;
  const take = 12;
  const skip = (page - 1) * take;

  const where: any = { status: "APPROVED" };
  if (category) where.category = category;
  if (state) where.state = state;
  if (search) {
    where.OR = [
      { bio: { contains: search, mode: "insensitive" } },
      { company: { contains: search, mode: "insensitive" } },
      { user: { name: { contains: search, mode: "insensitive" } } },
    ];
  }

  const db: any = prisma;
  const [total, items] = await Promise.all([
    db.professional.count({ where }),
    db.professional.findMany({ where, include: { user: { select: { name: true, email: true } }, credentials: true }, orderBy: { createdAt: "desc" }, skip, take }),
  ]);

  const totalPages = Math.ceil(total / take) || 1;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-gradient-to-br from-black to-gray-900 text-white rounded-lg p-8 mb-6">
        <h1 className="text-3xl font-bold">Professionals Directory</h1>
        <p className="mt-2 text-gray-300">Connect with verified real estate professionals across Nigeria</p>
      </div>

      <div className="mb-6">
        <ProfessionalFilters />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((p: any) => (
          <Card key={p.id} className="border-t-2 border-[#D4AF37]">
            <CardHeader>
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-full bg-[#D4AF37] flex items-center justify-center text-black font-semibold">{(p.user?.name || "").split(" ").map((n: string)=>n[0]).join("")}</div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">{p.user?.name ?? "-"}</h3>
                    {p.isVerified && <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded">Verified</span>}
                  </div>
                  <div className="text-sm text-muted-foreground">{p.category.replace(/_/g, " ")}</div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{p.company ?? ""}</p>
              <p className="text-sm mt-2">{p.location}, {p.state}</p>
              <p className="text-sm mt-2">{p.experience} years experience</p>
              <div className="mt-4">
                <Link href={`/professionals/${p.id}`} className="inline-block bg-[#D4AF37] text-black px-4 py-2 rounded">View Profile</Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex items-center justify-between mt-8">
        <div />
        <div className="space-x-2">
          <a href={`?page=${Math.max(1, page-1)}`} className={`px-4 py-2 border rounded ${page<=1?"opacity-50 pointer-events-none":""}`}>Previous</a>
          <span className="px-3">{page} / {totalPages}</span>
          <a href={`?page=${Math.min(totalPages, page+1)}`} className={`px-4 py-2 border rounded ${page>=totalPages?"opacity-50 pointer-events-none":""}`}>Next</a>
        </div>
      </div>
    </div>
  );
}
