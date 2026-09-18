"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

const baseLinks = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/dashboard/profile", label: "Profile" },
  { href: "/dashboard/enquiries", label: "Enquiries" },
  { href: "/dashboard/saved", label: "Saved Listings" },
  { href: "/dashboard/vendor", label: "Vendor Dashboard" },
  { href: "/dashboard/settings", label: "Settings" },
];

const roleLinks = [
  { href: "/dashboard/listings", label: "My Listings" },
  { href: "/dashboard/listings/new", label: "Add Listing" },
  { href: "/dashboard/kyc", label: "Identity Verification" },
];

export function DashboardSidebar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [unreadEnquiries, setUnreadEnquiries] = useState(0);

  const isSeller = session?.user?.role === "SELLER";

  useEffect(() => {
    if (!session?.user) return;
    fetch("/api/enquiries/unread")
      .then((res) => res.json())
      .then((data) => setUnreadEnquiries(data.count ?? 0))
      .catch(() => {});
  }, [session?.user]);

  const allLinks = [
    ...baseLinks.slice(0, 3),
    ...(isSeller ? roleLinks : []),
    ...baseLinks.slice(3),
  ];

  return (
    <aside className="w-64 bg-white border-r hidden md:flex flex-col h-screen sticky top-0">
      <nav className="flex flex-col h-full p-4">
        <ul className="flex-1 space-y-2">
          {allLinks.map((link) => (
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
                {link.href === "/dashboard/enquiries" && unreadEnquiries > 0 && (
                  <Badge className="bg-[#D4AF37] text-black hover:bg-[#D4AF37]">{unreadEnquiries}</Badge>
                )}
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
    </aside>
  );
}
