import Link from "next/link";
import { Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-4 text-center">
      <div>
        <p className="text-8xl font-bold text-blue-600">404</p>
        <h1 className="mt-4 text-2xl font-bold">Page Not Found</h1>
        <p className="mt-2 text-muted-foreground">
          Sorry, we couldn&apos;t find the page you&apos;re looking for.
        </p>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row">
        <Link href="/">
          <button className="flex items-center gap-2 px-6 py-3 bg-[#D4AF37] hover:bg-[#B8961E] text-black font-semibold rounded-lg transition-colors">
            <Home className="w-4 h-4" />
            <span>Back to Home</span>
          </button>
        </Link>
        <Link href="/listings">
          <button className="flex items-center gap-2 px-6 py-3 border border-gray-300 hover:bg-gray-100 text-gray-800 font-semibold rounded-lg transition-colors">
            Browse Listings
          </button>
        </Link>
      </div>
      <p className="text-sm font-medium text-muted-foreground">RealX World</p>
    </div>
  );
}
