"use client";

import { useSearchParams, useRouter } from "next/navigation";
import React from "react";

const categories = [
  "SURVEYOR",
  "ARCHITECT",
  "ENGINEER",
  "CONTRACTOR",
  "LAWYER",
  "VALUER",
  "PLANNER",
  "LANDSCAPER",
  "PROJECT_MANAGER",
  "PROPERTY_MANAGER",
  "OTHER",
];

const states = [
  // List of 36 states + FCT
  "Abia","Adamawa","Akwa Ibom","Anambra","Bauchi","Bayelsa","Benue","Borno","Cross River","Delta","Ebonyi","Edo","Ekiti","Enugu","Gombe","Imo","Jigawa","Kaduna","Kano","Katsina","Kebbi","Kogi","Kwara","Lagos","Nasarawa","Niger","Ogun","Ondo","Osun","Oyo","Plateau","Rivers","Sokoto","Taraba","Yobe","Zamfara","FCT"
];

export function ProfessionalFilters() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const category = searchParams.get("category") ?? "";
  const state = searchParams.get("state") ?? "";
  const search = searchParams.get("search") ?? "";

  function setParam(key: string, value: string) {
    const params = new URLSearchParams(Array.from(searchParams.entries()));
    if (value) params.set(key, value); else params.delete(key);
    router.push(`/professionals?${params.toString()}`);
  }

  return (
    <div className="sticky top-16 z-40 bg-white border border-gray-100 rounded p-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <select value={category} onChange={(e) => setParam("category", e.target.value)} className="p-2 border rounded w-full sm:w-56">
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>{c.replace(/_/g, " ")}</option>
          ))}
        </select>
        <select value={state} onChange={(e) => setParam("state", e.target.value)} className="p-2 border rounded w-full sm:w-56">
          <option value="">All States</option>
          {states.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <input value={search} onChange={(e) => setParam("search", e.target.value)} placeholder="Search name, bio, company" className="p-2 border rounded flex-1" />
      </div>
    </div>
  );
}

export default ProfessionalFilters;
