"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const baseLinks = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/dashboard/profile", label: "Profile" },
  { href: "/dashboard/saved", label: "Saved Listings" },
  { href: "/dashboard/settings", label: "Settings" },
];

const roleLinks = [
  { href: "/dashboard/listings", label: "My Listings" },
  { href: "/dashboard/listings/new", label: "Add Listing" },
];

export function DashboardSidebar() {
  const { data: session } = useSession();
  const pathname = usePathname();

  const isSellerOrAgent = session?.user?.role === "SELLER" || session?.user?.role === "AGENT";

  const allLinks = [
    ...baseLinks.slice(0, 2),
    ...(isSellerOrAgent ? roleLinks : []),
    ...baseLinks.slice(2),
  ];

  return (
    <aside className="w-64 bg-white border-r hidden md:block">
      <nav className="p-4">
        <ul className="space-y-2">
          {allLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className={cn(
                  "block px-4 py-2 rounded-md text-sm font-medium transition-colors",
                  pathname === link.href
                    ? "bg-[#D4AF37]/10 text-[#D4AF37] font-semibold border-l-2 border-[#D4AF37]"
                    : "text-gray-600 hover:text-[#D4AF37] hover:bg-gray-50"
                )}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
