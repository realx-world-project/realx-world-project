"use client";

import Link from "next/link";
import Image from "next/image";
import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/listings", label: "Listings" },
  { href: "/about", label: "About" },
  { href: "/service", label: "Service" },
];

const getRoleVariant = (role: string) => {
  switch (role) {
    case "BUYER":  return "secondary";
    case "SELLER": return "default";
    case "AGENT":  return "outline";
    case "ADMIN":  return "destructive";
    default:       return "secondary";
  }
};

export function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();

  const userInitials = session?.user?.name
    ? session.user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : "U";

  return (
    <nav className="sticky top-0 z-50 w-full bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link href="/" className="flex items-center">
            <div className="bg-white rounded p-1">
              <Image
                src="/logo.jpeg"
                alt="RealX World"
                width={100}
                height={33}
                className="object-contain"
                priority
              />
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "text-sm font-medium transition-colors pb-0.5",
                    isActive
                      ? "text-[#D4AF37] font-semibold border-b-2 border-[#D4AF37]"
                      : "text-gray-600 hover:text-[#D4AF37]"
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* Desktop Auth */}
          <div className="hidden md:flex items-center space-x-3">
            {session ? (
              <>
                <Badge variant={getRoleVariant(session.user.role)}>
                  {session.user.role}
                </Badge>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="rounded-full focus:outline-none focus:ring-2 focus:ring-[#D4AF37]">
                      <Avatar className="cursor-pointer">
                        <AvatarFallback>{userInitials}</AvatarFallback>
                      </Avatar>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard/listings">My Listings</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard/saved">Saved Listings</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard/profile">Profile</Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => signOut()}>
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-sm font-medium text-gray-700 hover:text-[#D4AF37] transition-colors"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="bg-[#D4AF37] hover:bg-[#B8961E] text-black text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
                >
                  Register
                </Link>
              </>
            )}
          </div>

          {/* Mobile Hamburger */}
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="text-gray-700 hover:text-[#D4AF37]">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="bg-white w-72">
                <div className="flex flex-col h-full">
                  <nav className="flex flex-col space-y-1 mt-8 flex-1">
                    {navLinks.map((link) => {
                      const isActive = pathname === link.href;
                      return (
                        <Link
                          key={link.href}
                          href={link.href}
                          className={cn(
                            "px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                            isActive
                              ? "text-[#D4AF37] bg-[#D4AF37]/10 font-semibold"
                              : "text-gray-700 hover:text-[#D4AF37] hover:bg-gray-50"
                          )}
                        >
                          {link.label}
                        </Link>
                      );
                    })}
                  </nav>

                  <div className="border-t border-gray-100 pt-4 pb-6 space-y-1">
                    {session ? (
                      <>
                        <div className="flex items-center space-x-2 px-4 py-2">
                          <Avatar>
                            <AvatarFallback>{userInitials}</AvatarFallback>
                          </Avatar>
                          <Badge variant={getRoleVariant(session.user.role)}>
                            {session.user.role}
                          </Badge>
                        </div>
                        <Link href="/dashboard/listings" className="block px-4 py-2 text-sm text-gray-700 hover:text-[#D4AF37] transition-colors">
                          My Listings
                        </Link>
                        <Link href="/dashboard/saved" className="block px-4 py-2 text-sm text-gray-700 hover:text-[#D4AF37] transition-colors">
                          Saved Listings
                        </Link>
                        <Link href="/dashboard/profile" className="block px-4 py-2 text-sm text-gray-700 hover:text-[#D4AF37] transition-colors">
                          Profile
                        </Link>
                        <Button
                          variant="ghost"
                          onClick={() => signOut()}
                          className="w-full justify-start text-sm text-gray-700 hover:text-[#D4AF37] px-4"
                        >
                          Sign Out
                        </Button>
                      </>
                    ) : (
                      <>
                        <Link
                          href="/login"
                          className="block px-4 py-3 text-sm font-medium text-gray-700 hover:text-[#D4AF37] transition-colors"
                        >
                          Login
                        </Link>
                        <div className="px-4">
                          <Link
                            href="/register"
                            className="block px-4 py-2 text-sm font-semibold text-center bg-[#D4AF37] hover:bg-[#B8961E] text-black rounded-lg transition-colors"
                          >
                            Register
                          </Link>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>

        </div>
      </div>
    </nav>
  );
}
