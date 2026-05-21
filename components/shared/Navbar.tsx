"use client";

import Link from "next/link";
import Image from "next/image";
import { useSession, signOut } from "next-auth/react";
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

const Menu = () => <span>☰</span>;

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/listings", label: "Listings" },
  { href: "/about", label: "About" },
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

  const userInitials = session?.user?.name
    ? session.user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : "U";

  return (
    <nav className="border-b bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">

          {/* Logo */}
          <div className="flex items-center">
            <Link href="/">
              <Image
                src="/logo.jpeg"
                alt="RealX World"
                width={120}
                height={40}
                className="object-contain"
                priority
              />
            </Link>
          </div>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-white hover:text-yellow-400 transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Desktop Auth Section */}
          <div className="hidden md:flex items-center space-x-4">
            {session ? (
              <>
                <Badge variant={getRoleVariant(session.user.role)}>
                  {session.user.role}
                </Badge>

                {/*
                  asChild delegates the trigger element to the explicit <button>
                  below, preventing DropdownMenuTrigger from adding its own
                  <button> wrapper around Avatar.
                */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="rounded-full focus:outline-none focus:ring-2 focus:ring-[#D4AF37]">
                      <Avatar className="cursor-pointer">
                        <AvatarFallback>{userInitials}</AvatarFallback>
                      </Avatar>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
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
                  className="border border-white text-white bg-transparent hover:bg-white hover:text-black transition-colors px-4 py-2 rounded-md text-sm font-medium"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="bg-[#D4AF37] hover:bg-[#B8961E] text-black font-semibold transition-colors px-4 py-2 rounded-md text-sm"
                >
                  Register
                </Link>
              </>
            )}
          </div>

          {/* Mobile Hamburger */}
          <div className="md:hidden flex items-center">
            <Sheet>
              {/*
                asChild lets SheetTrigger use the Button element directly
                instead of wrapping it in its own <button>, which would
                produce a <button> inside a <button>.
              */}
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="text-white hover:text-[#D4AF37]">
                  <Menu />
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <div className="flex flex-col space-y-4 mt-8">
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="text-lg text-gray-700 hover:text-[#D4AF37] transition-colors"
                    >
                      {link.label}
                    </Link>
                  ))}

                  {session ? (
                    <>
                      <div className="flex items-center space-x-2">
                        <Badge variant={getRoleVariant(session.user.role)}>
                          {session.user.role}
                        </Badge>
                        <Avatar>
                          <AvatarFallback>{userInitials}</AvatarFallback>
                        </Avatar>
                      </div>
                      <Link
                        href="/dashboard/listings"
                        className="text-lg text-gray-700 hover:text-[#D4AF37] transition-colors"
                      >
                        My Listings
                      </Link>
                      <Link
                        href="/dashboard/saved"
                        className="text-lg text-gray-700 hover:text-[#D4AF37] transition-colors"
                      >
                        Saved Listings
                      </Link>
                      <Link
                        href="/dashboard/profile"
                        className="text-lg text-gray-700 hover:text-[#D4AF37] transition-colors"
                      >
                        Profile
                      </Link>
                      {/* Plain button — direct child of div, no nesting issue */}
                      <Button
                        variant="ghost"
                        onClick={() => signOut()}
                        className="justify-start"
                      >
                        Sign Out
                      </Button>
                    </>
                  ) : (
                    <>
                      <Link
                        href="/login"
                        className="block px-4 py-2 rounded-md text-sm font-medium border border-gray-300 text-gray-700 hover:border-[#D4AF37] hover:text-[#D4AF37] transition-colors"
                      >
                        Login
                      </Link>
                      <Link
                        href="/register"
                        className="block px-4 py-2 rounded-md text-sm font-semibold bg-[#D4AF37] hover:bg-[#B8961E] text-black transition-colors"
                      >
                        Register
                      </Link>
                    </>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>

        </div>
      </div>
    </nav>
  );
}
