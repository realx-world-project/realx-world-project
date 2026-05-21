"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const Menu = () => <span>☰</span>;

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

export function MobileDashboardNav() {
  const { data: session } = useSession();
  const pathname = usePathname();

  const isSellerOrAgent =
    session?.user?.role === "SELLER" || session?.user?.role === "AGENT";

  const allLinks = [
    ...baseLinks.slice(0, 2),
    ...(isSellerOrAgent ? roleLinks : []),
    ...baseLinks.slice(2),
  ];

  return (
    <div className="md:hidden">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="fixed top-4 left-4 z-50">
            <Menu />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64">
          <nav className="mt-8">
            <ul className="space-y-2">
              {allLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={cn(
                      "block px-4 py-2 rounded-md text-sm font-medium transition-colors",
                      pathname === link.href
                        ? "bg-[#D4AF37] text-black font-semibold"
                        : "text-gray-700 hover:text-[#D4AF37] hover:bg-gray-50"
                    )}
                  >
                    {link.label}
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
