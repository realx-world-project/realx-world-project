import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-gray-100 border-t">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">About</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="text-gray-600 hover:text-blue-600">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/careers" className="text-gray-600 hover:text-blue-600">
                  Careers
                </Link>
              </li>
              <li>
                <Link href="/press" className="text-gray-600 hover:text-blue-600">
                  Press
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/listings" className="text-gray-600 hover:text-blue-600">
                  Browse Listings
                </Link>
              </li>
              <li>
                <Link href="/sell" className="text-gray-600 hover:text-blue-600">
                  Sell Your Property
                </Link>
              </li>
              <li>
                <Link href="/agents" className="text-gray-600 hover:text-blue-600">
                  Find an Agent
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact</h3>
            <ul className="space-y-2">
              <li className="text-gray-600">support@realxworld.com</li>
              <li className="text-gray-600">+234 123 456 7890</li>
              <li className="text-gray-600">Lagos, Nigeria</li>
            </ul>
          </div>
        </div>
        <div className="border-t mt-8 pt-8 text-center">
          <p className="text-gray-600">© 2025 RealX World. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}