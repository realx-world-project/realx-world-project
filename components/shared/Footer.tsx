import Link from "next/link";
import Image from "next/image";

export function Footer() {
  return (
    <footer className="bg-[#0A0A0A] border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="bg-black rounded-lg p-2 inline-block">
            <Image
              src="/logo.jpeg"
              alt="RealX World"
              width={100}
              height={33}
              className="object-contain"
            />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-semibold text-[#D4AF37] mb-4">About</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="text-gray-400 hover:text-[#D4AF37] transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/careers" className="text-gray-400 hover:text-[#D4AF37] transition-colors">
                  Careers
                </Link>
              </li>
              <li>
                <Link href="/press" className="text-gray-400 hover:text-[#D4AF37] transition-colors">
                  Press
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-[#D4AF37] mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/listings" className="text-gray-400 hover:text-[#D4AF37] transition-colors">
                  Browse Listings
                </Link>
              </li>
              <li>
                <Link href="/sell" className="text-gray-400 hover:text-[#D4AF37] transition-colors">
                  Sell Your Property
                </Link>
              </li>
              <li>
                <Link href="/agents" className="text-gray-400 hover:text-[#D4AF37] transition-colors">
                  Find an Agent
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-[#D4AF37] mb-4">Contact</h3>
            <ul className="space-y-2">
              <li className="text-gray-400">support@realxworld.com</li>
              <li className="text-gray-400">+234 123 456 7890</li>
              <li className="text-gray-400">Lagos, Nigeria</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-white/10 mt-8 pt-8 text-center">
          <p className="text-gray-400">© 2025 RealX World. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
