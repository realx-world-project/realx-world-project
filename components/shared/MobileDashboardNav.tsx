"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import { LogOut } from "lucide-react";
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
        <SheetContent side="left" className="w-64 flex flex-col">
          <nav className="flex flex-col flex-1 mt-8">
            <ul className="flex-1 space-y-2">
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

            <div className="mt-auto pt-4 border-t border-gray-200">
              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="flex items-center gap-3 w-full px-3 py-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm font-medium"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </nav>
        </SheetContent>
      </Sheet>
    </div>
  );
}
