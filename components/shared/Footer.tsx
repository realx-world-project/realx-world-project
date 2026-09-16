import Link from "next/link";
import Image from "next/image";

export function Footer() {
  return (
    <footer className="bg-[#0A0A0A] border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* About */}
          <div>
            <div className="bg-black rounded-lg p-2 inline-block">
              <Image
                src="/logo.jpeg"
                alt="RealX World"
                width={100}
                height={33}
                className="object-contain"
              />
            </div>
            <p className="mt-4 text-sm text-gray-400">
              A world of Varied Real Estate Transactions and Exchange.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold text-[#D4AF37] mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/listings" className="text-gray-400 hover:text-[#D4AF37] transition-colors">
                  Browse Listings
                </Link>
              </li>
              <li>
                <Link href="/listings?type=SALE" className="text-gray-400 hover:text-[#D4AF37] transition-colors">
                  For Sale
                </Link>
              </li>
              <li>
                <Link href="/listings?listingGroup=RENT" className="text-gray-400 hover:text-[#D4AF37] transition-colors">
                  Rentals
                </Link>
              </li>
              <li>
                <Link href="/professionals" className="text-gray-400 hover:text-[#D4AF37] transition-colors">
                  Professionals
                </Link>
              </li>
              <li>
                <Link href="/materials" className="text-gray-400 hover:text-[#D4AF37] transition-colors">
                  Materials
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-gray-400 hover:text-[#D4AF37] transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/service" className="text-gray-400 hover:text-[#D4AF37] transition-colors">
                  Our Services
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal & Support */}
          <div>
            <h3 className="text-lg font-semibold text-[#D4AF37] mb-4">Legal & Support</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/terms" className="text-gray-400 hover:text-[#D4AF37] transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-gray-400 hover:text-[#D4AF37] transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <a href="mailto:info@realxworld.net" className="text-gray-400 hover:text-[#D4AF37] transition-colors">
                  Contact Us
                </a>
              </li>
              <li>
                <a href="mailto:support@realxworld.net" className="text-gray-400 hover:text-[#D4AF37] transition-colors">
                  Support
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-semibold text-[#D4AF37] mb-4">Contact</h3>
            <ul className="space-y-2">
              <li className="text-gray-400">Email: info@realxworld.net</li>
              <li className="text-gray-400">Support: support@realxworld.net</li>
              <li className="text-gray-400">Location: Lagos, Nigeria</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-white/10 mt-8 pt-8 text-center">
          <p className="text-gray-400">© 2026 RealX World. All rights reserved.</p>
          <p className="mt-1 text-sm text-gray-500">
            Built with integrity, transparency and technological innovation.
          </p>
        </div>
      </div>
    </footer>
  );
}
