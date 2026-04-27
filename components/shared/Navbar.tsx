"use client";

import Link from "next/link";
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
// import { Menu } from "lucide-react";
const Menu = () => <span>☰</span>;

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/listings", label: "Listings" },
  { href: "/about", label: "About" },
];

const getRoleVariant = (role: string) => {
  switch (role) {
    case "BUYER":
      return "secondary";
    case "SELLER":
      return "default";
    case "AGENT":
      return "outline";
    case "ADMIN":
      return "destructive";
    default:
      return "secondary";
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
    <nav className="border-b bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="text-2xl font-bold text-blue-600">
              Relex World
            </Link>
          </div>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-gray-700 hover:text-blue-600 transition-colors"
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
                <DropdownMenu>
                  <DropdownMenuTrigger>
                    <Avatar className="cursor-pointer">
                      <AvatarFallback>{userInitials}</AvatarFallback>
                    </Avatar>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem>
                      <Link href="/dashboard/listings">My Listings</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Link href="/dashboard/saved">Saved Listings</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
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
                <Button variant="ghost">
                  <Link href="/login">Login</Link>
                </Button>
                <Button>
                  <Link href="/register">Register</Link>
                </Button>
              </>
            )}
          </div>

          <div className="md:hidden flex items-center">
            <Sheet>
              <SheetTrigger>
                <Button variant="ghost" size="icon">
                  <Menu />
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <div className="flex flex-col space-y-4 mt-8">
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="text-lg text-gray-700 hover:text-blue-600"
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
                        className="text-lg text-gray-700 hover:text-blue-600"
                      >
                        My Listings
                      </Link>
                      <Link
                        href="/dashboard/saved"
                        className="text-lg text-gray-700 hover:text-blue-600"
                      >
                        Saved Listings
                      </Link>
                      <Link
                        href="/dashboard/profile"
                        className="text-lg text-gray-700 hover:text-blue-600"
                      >
                        Profile
                      </Link>
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
                      <Button variant="ghost">
                        <Link href="/login">Login</Link>
                      </Button>
                      <Button>
                        <Link href="/register">Register</Link>
                      </Button>
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