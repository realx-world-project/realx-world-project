"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function ProfessionalDashboardClient({ initialProfessional }: { initialProfessional: any }) {
  const router = useRouter();
  const [prof, setProf] = useState<any>(initialProfessional || null);
  const [form, setForm] = useState<any>({
    category: prof?.category ?? "",
    bio: prof?.bio ?? "",
    company: prof?.company ?? "",
    experience: prof?.experience ?? 1,
    location: prof?.location ?? "",
    state: prof?.state ?? "",
    phone: prof?.phone ?? "",
    website: prof?.website ?? "",
  });
  const [credName, setCredName] = useState("");
  const [credFileUrl, setCredFileUrl] = useState("");
  const [credPublicId, setCredPublicId] = useState("");

  async function submitProfile(e: React.FormEvent) {
    e.preventDefault();
    if (!prof) {
      // create
      const res = await fetch(`/api/professionals`, { method: "POST", body: JSON.stringify(form), headers: { "Content-Type": "application/json" } });
      if (res.ok) {
        const data = await res.json();
        setProf(data);
        router.refresh();
      }
    } else {
      const res = await fetch(`/api/professionals/${prof.id}`, { method: "PATCH", body: JSON.stringify(form), headers: { "Content-Type": "application/json" } });
      if (res.ok) {
        const data = await res.json();
        setProf(data);
        router.refresh();
      }
    }
  }

  async function addCredential(e: React.FormEvent) {
    e.preventDefault();
    if (!prof) return alert("Create profile first");
    const res = await fetch(`/api/professionals/${prof.id}/credentials`, { method: "POST", body: JSON.stringify({ name: credName, fileUrl: credFileUrl, publicId: credPublicId }), headers: { "Content-Type": "application/json" } });
    if (res.ok) {
      const c = await res.json();
      setProf({ ...prof, credentials: [...(prof.credentials||[]), c] });
      setCredName(""); setCredFileUrl(""); setCredPublicId("");
    } else {
      alert("Failed to add credential");
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h2 className="text-2xl font-semibold">Professional Profile</h2>
      <form onSubmit={submitProfile} className="mt-4 space-y-3">
        <div>
          <label className="block text-sm">Category</label>
          <input value={form.category} onChange={(e)=>setForm({...form, category:e.target.value})} className="w-full p-2 border rounded" />
        </div>
        <div>
          <label className="block text-sm">Bio</label>
          <textarea value={form.bio} onChange={(e)=>setForm({...form, bio:e.target.value})} className="w-full p-2 border rounded" rows={6} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm">Company</label>
            <input value={form.company} onChange={(e)=>setForm({...form, company:e.target.value})} className="w-full p-2 border rounded" />
          </div>
          <div>
            <label className="block text-sm">Experience (years)</label>
            <input type="number" min={1} value={form.experience} onChange={(e)=>setForm({...form, experience:parseInt(e.target.value||"1",10)})} className="w-full p-2 border rounded" />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm">Location / Area</label>
            <input value={form.location} onChange={(e)=>setForm({...form, location:e.target.value})} className="w-full p-2 border rounded" />
          </div>
          <div>
            <label className="block text-sm">State</label>
            <input value={form.state} onChange={(e)=>setForm({...form, state:e.target.value})} className="w-full p-2 border rounded" />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm">Phone</label>
            <input value={form.phone} onChange={(e)=>setForm({...form, phone:e.target.value})} className="w-full p-2 border rounded" />
          </div>
          <div>
            <label className="block text-sm">Website</label>
            <input value={form.website} onChange={(e)=>setForm({...form, website:e.target.value})} className="w-full p-2 border rounded" />
          </div>
        </div>
        <div>
          <button className="bg-[#D4AF37] text-black px-4 py-2 rounded">{prof?"Update Profile":"Submit for Review"}</button>
        </div>
      </form>

      <div className="mt-6">
        <h3 className="text-lg font-semibold">Credentials</h3>
        <ul className="mt-2 list-disc list-inside">
          {(prof?.credentials||[]).map((c:any)=> <li key={c.id}>{c.name}</li>)}
        </ul>

        <form onSubmit={addCredential} className="mt-4 space-y-2">
          <div>
            <label className="block text-sm">Credential name</label>
            <input value={credName} onChange={(e)=>setCredName(e.target.value)} className="w-full p-2 border rounded" />
          </div>
          <div>
            <label className="block text-sm">File URL (from Cloudinary)</label>
            <input value={credFileUrl} onChange={(e)=>setCredFileUrl(e.target.value)} className="w-full p-2 border rounded" />
          </div>
          <div>
            <label className="block text-sm">Public ID (Cloudinary)</label>
            <input value={credPublicId} onChange={(e)=>setCredPublicId(e.target.value)} className="w-full p-2 border rounded" />
          </div>
          <div>
            <button className="bg-[#D4AF37] text-black px-4 py-2 rounded">Add Credential</button>
          </div>
        </form>
      </div>
    </div>
  );
}
