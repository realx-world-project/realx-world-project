import { Metadata } from "next";
import Link from "next/link";
import { Database, Users, Target } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Consultancy — RealX World",
  description:
    "Data-driven real estate guidance and professional advice across land acquisition, development, and investment.",
};

const cards = [
  {
    icon: Database,
    title: "Real Estate Data",
    body: "We source, manage, and analyse real estate data powered by cutting-edge technology, giving our clients accurate market intelligence.",
  },
  {
    icon: Users,
    title: "Professional Network",
    body: "Our wide-area network of professionals in the built environment ensures that sound professional advice is always available.",
  },
  {
    icon: Target,
    title: "Goal-Oriented Advice",
    body: "We analyse your business interests and projected goals, then provide a clear professional roadmap to help you achieve them.",
  },
];

export default function ConsultancyPage() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-black to-gray-900 py-16 sm:py-24">
        <div className="container mx-auto px-4 text-center">
          <h1 className="mb-4 text-3xl font-bold text-[#D4AF37] sm:text-5xl">
            Consultancy
          </h1>
          <p className="mx-auto max-w-2xl text-base text-gray-300 sm:text-lg">
            Data-driven guidance for every real estate decision
          </p>
        </div>
      </section>

      {/* Section 1 */}
      <section className="py-12 sm:py-16">
        <div className="container mx-auto px-4">
          <h2 className="mb-6 text-center text-2xl font-bold sm:text-3xl">
            Our Consultancy Services
          </h2>
          <p className="mx-auto max-w-3xl text-center text-lg text-gray-700">
            To ensure that our clients have the requisite opportunities to make
            adequate and timely decisions, we deliver up-to-date information on
            the current happenings in the world of Real Estate and in each area
            of interest and operation. Real Estate data sourcing and management,
            driven by cutting-edge technology, is at the core of our operations.
            Having analysed our clients&apos; business interests and determined
            their projected goals, we also provide professional advice on how
            they can achieve those goals.
          </p>
        </div>
      </section>

      {/* Section 2 */}
      <section className="bg-gray-50 py-12 sm:py-16">
        <div className="container mx-auto px-4">
          <h2 className="mb-6 text-center text-2xl font-bold sm:text-3xl">
            An Interconnected Professional Network
          </h2>
          <p className="mx-auto mb-10 max-w-3xl text-center text-gray-700">
            At Real-X, we interconnect various professionals in the built
            industry for proper synergy. With the availability of these
            professionals, whose range of professional services forms the
            structure of the Real-X world, an Open Market is created with
            limitless opportunities to handle a wide range of activities
            including Land Acquisition, Real Estate Sales and Agency, Real
            Estate Development and Redevelopment, Surveying, Planning,
            Landscaping, Asset Valuation, Project Management, and Property
            Management.
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

      {/* Section 3 — Dark, two white cards side by side */}
      <section className="bg-[#0A0A0A] py-12 sm:py-16">
        <div className="container mx-auto px-4">
          <h2 className="mb-10 text-center text-2xl font-bold text-[#D4AF37] sm:text-3xl">
            Support Services
          </h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <Card className="border-t-2 border-[#D4AF37] shadow-sm">
              <CardContent className="pt-6 pb-6">
                <h3 className="mb-3 text-lg font-semibold">
                  After-Sales Support
                </h3>
                <p className="text-sm text-muted-foreground">
                  We provide a system of after-sales support services to enable
                  the client to understand the possibilities of investment,
                  divestment, and reinvestment available with prior investments
                  already made, helping them make correct choices and move on to
                  what is next, while leaving a reliable footprint of an
                  unbroken trail of transaction history. Our complete services
                  are available 24 hours a day.
                </p>
              </CardContent>
            </Card>
            <Card className="border-t-2 border-[#D4AF37] shadow-sm">
              <CardContent className="pt-6 pb-6">
                <h3 className="mb-3 text-lg font-semibold">
                  Corporate Training
                </h3>
                <p className="text-sm text-muted-foreground">
                  Designed to meet our clients&apos; specific software and
                  maintenance needs by training their staff and personnel on the
                  use of services and products provided by Real-X World.
                </p>
              </CardContent>
            </Card>
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
