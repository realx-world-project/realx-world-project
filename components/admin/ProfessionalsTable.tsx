"use client";

import React, { useState } from "react";
import Link from "next/link";

export default function ProfessionalsTable({ initialItems, counts }: { initialItems: any[]; counts: Record<string, number> }) {
  const [items, setItems] = useState(initialItems || []);

  async function updateStatus(id: string, status: string) {
    const res = await fetch(`/api/admin/professionals/${id}`, { method: "PATCH", body: JSON.stringify({ status }), headers: { "Content-Type": "application/json" } });
    if (res.ok) {
      const updated = await res.json();
      setItems((prev) => prev.map((it) => (it.id === id ? updated : it)));
    } else {
      alert("Failed to update status");
    }
  }

  return (
    <div>
      <div className="flex space-x-2 mb-4">
        <a className="px-3 py-1 bg-gray-100 rounded">All ({items.length})</a>
        <a className="px-3 py-1 bg-yellow-100 rounded">Pending ({counts?.PENDING ?? 0})</a>
        <a className="px-3 py-1 bg-green-100 rounded">Approved ({counts?.APPROVED ?? 0})</a>
        <a className="px-3 py-1 bg-red-100 rounded">Rejected ({counts?.REJECTED ?? 0})</a>
        <a className="px-3 py-1 bg-red-200 rounded">Suspended ({counts?.SUSPENDED ?? 0})</a>
      </div>

      <div className="overflow-x-auto border rounded">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-2 text-left">Name</th>
              <th className="p-2 text-left">Email</th>
              <th className="p-2 text-left">Category</th>
              <th className="p-2 text-left">Status</th>
              <th className="p-2 text-left">Location</th>
              <th className="p-2 text-left">Submitted</th>
              <th className="p-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((p) => (
              <tr key={p.id} className="border-t">
                <td className="p-2">{p.user?.name}</td>
                <td className="p-2">{p.user?.email}</td>
                <td className="p-2">{p.category}</td>
                <td className="p-2">{p.status}</td>
                <td className="p-2">{p.location}, {p.state}</td>
                <td className="p-2">{new Date(p.createdAt).toLocaleString()}</td>
                <td className="p-2 space-x-2">
                  <Link href={`/professionals/${p.id}`} className="text-blue-600">View</Link>
                  <button onClick={()=>updateStatus(p.id, "APPROVED")} className="px-2 py-1 bg-green-100 rounded">Approve</button>
                  <button onClick={()=>{ const reason = prompt("Rejection reason (optional)"); if (reason!==null) updateStatus(p.id, "REJECTED"); }} className="px-2 py-1 bg-red-100 rounded">Reject</button>
                  <button onClick={()=>updateStatus(p.id, "SUSPENDED")} className="px-2 py-1 bg-red-200 rounded">Suspend</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
