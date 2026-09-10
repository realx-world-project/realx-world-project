"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { nigerianStates } from "@/lib/materials";

export function VendorFilters() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const state = searchParams.get("state") ?? "";
  const search = searchParams.get("search") ?? "";

  function setParam(key: string, value: string) {
    const params = new URLSearchParams(Array.from(searchParams.entries()));
    if (value) params.set(key, value);
    else params.delete(key);
    router.push(`/vendors?${params.toString()}`);
  }

  return (
    <div className="sticky top-16 z-40 rounded border border-gray-100 bg-white p-4">
      <div className="flex flex-col gap-3 sm:flex-row">
        <select
          value={state}
          onChange={(e) => setParam("state", e.target.value)}
          className="w-full rounded border p-2 sm:w-56"
        >
          <option value="">All States</option>
          {nigerianStates.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <input
          value={search}
          onChange={(e) => setParam("search", e.target.value)}
          placeholder="Search vendors"
          className="flex-1 rounded border p-2"
        />
      </div>
    </div>
  );
}

export default VendorFilters;
