import { Metadata } from "next";
import Link from "next/link";
import { Globe, Zap, Link as LinkIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Open Market — RealX World",
  description:
    "A near-perfect open market for genuine real estate transactions with limitless opportunities across the globe.",
};

const cards = [
  {
    icon: Globe,
    title: "No Restrictions",
    body: "Vendors and buyers operate freely in the same space, guided only by our transparent Terms and Conditions.",
  },
  {
    icon: Zap,
    title: "Real-Time Transactions",
    body: "Meet your real estate needs with precision in real time — from listing to closing, everything happens on one platform.",
  },
  {
    icon: LinkIcon,
    title: "Connected Professionals",
    body: "Brokers, clients, and built-environment professionals all connect in one seamless marketplace.",
  },
];

export default function OpenMarketPage() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-black to-gray-900 py-16 sm:py-24">
        <div className="container mx-auto px-4 text-center">
          <h1 className="mb-4 text-3xl font-bold text-[#D4AF37] sm:text-5xl">
            Open Market
          </h1>
          <p className="mx-auto max-w-2xl text-base text-gray-300 sm:text-lg">
            Limitless opportunities for genuine real estate transactions
          </p>
        </div>
      </section>

      {/* Section 1 */}
      <section className="py-12 sm:py-16">
        <div className="container mx-auto px-4">
          <h2 className="mb-6 text-center text-2xl font-bold sm:text-3xl">
            A Near-Perfect Market
          </h2>
          <p className="mx-auto max-w-3xl text-center text-lg text-gray-700">
            At Real-X, we operate a near-perfect market system for a range of
            genuine Real Estate transactions, including but not limited to:
            Agency, Property Management, Real Estate Sales, Real Estate
            Financing, Project Management, Consultancy, Land Acquisition,
            Property Development, and Redevelopment. The idea is to provide a
            seamless platform where brokers, clients, and professionals enjoy
            the best possible user experience.
          </p>
        </div>
      </section>

      {/* Section 2 */}
      <section className="bg-gray-50 py-12 sm:py-16">
        <div className="container mx-auto px-4">
          <h2 className="mb-6 text-center text-2xl font-bold sm:text-3xl">
            How It Works
          </h2>
          <p className="mx-auto mb-10 max-w-3xl text-center text-gray-700">
            It is an Open Market because both vendors and buyers operate in the
            same space without undue restrictions, following our laid-down Terms
            and Conditions. Real-X Open Market offers the unique opportunity and
            experience of meeting your needs with unimaginable precision in real
            time.
          </p>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            {cards.map((card) => {
              const Icon = card.icon;
              return (
                <Card
                  key={card.title}
                  className="border-t-2 border-[#D4AF37] shadow-sm"
                >
                  <CardContent className="pt-6 pb-6">
                    <Icon className="mb-4 h-8 w-8 text-[#D4AF37]" />
                    <h3 className="mb-2 text-lg font-semibold">{card.title}</h3>
                    <p className="text-sm text-muted-foreground">{card.body}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Back link */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <Link
            href="/service"
            className="text-sm font-medium text-[#D4AF37] hover:underline"
          >
            ← Back to Services
          </Link>
        </div>
      </section>
    </div>
  );
}
