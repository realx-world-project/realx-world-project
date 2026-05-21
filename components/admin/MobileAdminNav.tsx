"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const links = [
  { href: "/admin/dashboard", label: "Overview" },
  { href: "/admin/listings", label: "Listings", badge: "0" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/reports", label: "Reports" },
  { href: "/admin/audit", label: "Audit Log" },
  { href: "/admin/exports", label: "Exports" },
];

export function MobileAdminNav() {
  const pathname = usePathname();

  return (
    <div className="md:hidden">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="fixed top-4 left-4 z-50 text-gray-700 hover:text-[#D4AF37]">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 bg-white border-r border-gray-100">
          <div className="p-4 border-b border-gray-100">
            <span className="text-xs font-semibold uppercase tracking-widest text-[#D4AF37]">
              Admin Panel
            </span>
          </div>
          <nav className="mt-4 p-4">
            <ul className="space-y-1">
              {links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={cn(
                      "flex items-center justify-between px-4 py-2 rounded-md text-sm font-medium transition-colors",
                      pathname === link.href
                        ? "bg-[#D4AF37]/10 text-[#D4AF37] font-semibold border-l-2 border-[#D4AF37]"
                        : "text-gray-600 hover:text-[#D4AF37] hover:bg-gray-50"
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
        </SheetContent>
      </Sheet>
    </div>
  );
}
