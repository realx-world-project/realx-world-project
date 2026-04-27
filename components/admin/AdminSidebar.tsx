"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const links = [
  { href: "/admin/dashboard", label: "Overview" },
  { href: "/admin/listings", label: "Listings", badge: "0" }, // Placeholder for pending count
  { href: "/admin/users", label: "Users" },
  { href: "/admin/reports", label: "Reports" },
  { href: "/admin/audit", label: "Audit Log" },
  { href: "/admin/exports", label: "Exports" },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-white border-r hidden md:block">
      <nav className="p-4">
        <ul className="space-y-2">
          {links.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className={cn(
                  "flex items-center justify-between px-4 py-2 rounded-md text-sm font-medium transition-colors",
                  pathname === link.href
                    ? "bg-blue-100 text-blue-700"
                    : "text-gray-700 hover:bg-gray-100"
                )}
              >
                <span>{link.label}</span>
                {link.badge && (
                  <Badge variant="secondary" className="ml-2">
                    {link.badge}
                  </Badge>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}