import React from "react";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function ProfessionalProfile({ params }: { params: { id: string } }) {
  const { id } = params;
  const db: any = prisma;
  const prof = await db.professional.findUnique({ where: { id }, include: { user: { select: { name: true, email: true } }, credentials: true } });

  if (!prof || prof.status !== "APPROVED") {
    return (
      <div className="max-w-3xl mx-auto p-8">
        <Link href="/professionals" className="text-sm text-[#D4AF37]">← Back to Directory</Link>
        <h2 className="text-2xl font-semibold mt-6">Profile not found</h2>
        <p className="mt-2 text-muted-foreground">The requested professional profile could not be found.</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-8">
      <Link href="/professionals" className="text-sm text-[#D4AF37]">← Back to Directory</Link>

      <div className="bg-white border rounded-lg p-6 mt-4">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 rounded-full bg-[#D4AF37] flex items-center justify-center text-black font-semibold text-xl">{(prof.user?.name||"").split(" ").map((n:string)=>n[0]).join("")}</div>
          <div>
            <h1 className="text-2xl font-bold">{prof.user?.name}</h1>
            <div className="text-sm text-muted-foreground">{prof.category.replace(/_/g, " ")}{prof.isVerified && <span className="ml-2 text-green-700">Verified</span>}</div>
            <div className="mt-2">{prof.location}, {prof.state} • {prof.experience} years experience</div>
          </div>
        </div>

        <div className="mt-6">
          <h3 className="font-semibold">About</h3>
          <p className="mt-2 text-sm text-muted-foreground">{prof.bio}</p>
        </div>

        {prof.company && (
          <div className="mt-4">
            <h4 className="font-semibold">Company</h4>
            <p className="text-sm text-muted-foreground">{prof.company}</p>
          </div>
        )}

        {prof.website && (
          <div className="mt-4">
            <h4 className="font-semibold">Website</h4>
            <a href={prof.website} target="_blank" rel="noreferrer" className="text-[#D4AF37]">{prof.website}</a>
          </div>
        )}

        <div className="mt-4">
          <h4 className="font-semibold">Phone</h4>
          <a href={`tel:${prof.phone}`} className="inline-block mt-2 bg-[#D4AF37] text-black px-4 py-2 rounded">{prof.phone}</a>
        </div>

        <div className="mt-6">
          <h4 className="font-semibold">Credentials</h4>
          <ul className="mt-2 list-disc list-inside text-sm text-muted-foreground">
            {prof.credentials.map((c:any)=> (
              <li key={c.id}>{c.name}</li>
            ))}
            {prof.credentials.length===0 && <li>No credentials uploaded</li>}
          </ul>
        </div>

        <div className="mt-6">
          <h4 className="font-semibold">Enquire</h4>
          <p className="mt-2 text-sm">Contact via email: <a className="text-[#D4AF37]" href={`mailto:${prof.user.email}`}>{prof.user.email}</a></p>
        </div>

      </div>
    </div>
  );
}
