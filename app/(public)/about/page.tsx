import { Metadata } from "next";
import Link from "next/link";
import { Shield, Star, Briefcase, Cpu, CheckCircle2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "About Us — RealX World",
  description:
    "Learn about RealX World's mission, core values and commitment to transparent real estate transactions in Nigeria.",
};

const coreValues = [
  {
    icon: Shield,
    title: "Integrity & Transparency",
    body: "Integrity is the hallmark of a person who demonstrates sound moral and ethical principles. We believe transparency is the foundation of trust — secrecy breeds suspicion, openness builds confidence.",
  },
  {
    icon: Star,
    title: "Service",
    body: "We are committed to delivering exceptional service to every client, ensuring their real estate journey is smooth, informed, and rewarding from start to finish.",
  },
  {
    icon: Briefcase,
    title: "Professionalism",
    body: "Every transaction on RealX World is handled with the highest standards of professional conduct, ensuring reliable and consistent outcomes for all parties.",
  },
  {
    icon: Cpu,
    title: "Technological Innovation",
    body: "We leverage cutting-edge technology to power an open, transparent marketplace that enables world-best practices in Nigerian real estate.",
  },
];

export default function AboutPage() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-black to-gray-900 py-16 sm:py-24">
        <div className="container mx-auto px-4 text-center">
          <h1 className="mb-4 text-3xl font-bold text-[#D4AF37] sm:text-5xl">
            About RealX World
          </h1>
          <p className="mx-auto max-w-2xl text-base text-gray-300 sm:text-lg">
            A world of Varied Real Estate Transactions and Exchange
          </p>
        </div>
      </section>

      {/* Mission Statement */}
      <section className="py-12 sm:py-16">
        <div className="container mx-auto px-4">
          <p className="mx-auto max-w-3xl text-center text-lg text-gray-700">
            Real-X is a world of Varied Real Estate Transactions and Exchange.
            It is built on the pillars of INTEGRITY/TRANSPARENCY, SERVICE,
            PROFESSIONALISM and TECHNOLOGICAL INNOVATION. These are the core
            values of the company.
          </p>
        </div>
      </section>

      {/* Core Values */}
      <section className="bg-gray-50 py-12 sm:py-16">
        <div className="container mx-auto px-4">
          <div className="mb-10 text-center">
            <h2 className="text-2xl font-bold sm:text-3xl">Our Core Values</h2>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {coreValues.map((value) => {
              const Icon = value.icon;
              return (
                <Card
                  key={value.title}
                  className="border-t-2 border-[#D4AF37] shadow-sm"
                >
                  <CardContent className="pt-6 pb-6">
                    <Icon className="mb-4 h-8 w-8 text-[#D4AF37]" />
                    <h3 className="mb-2 text-lg font-semibold">{value.title}</h3>
                    <p className="text-sm text-muted-foreground">{value.body}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Building Trust */}
      <section className="bg-[#0A0A0A] py-12 sm:py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="mb-6 text-2xl font-bold text-[#D4AF37] sm:text-3xl">
            Building Trust Through Openness
          </h2>
          <p className="mx-auto max-w-3xl text-gray-300">
            Integrity is the foundation on which co-workers build relationships
            based on trust among themselves and with the client. At Real-X, we
            believe that secrecy is a strong foundation for suspicion which leads
            to mistrust. A person with integrity is trustworthy and reliable.
            This is why we hope to build an open market for genuine Real Estate
            transactions. With this, we can achieve world-best practices.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 sm:py-16">
        <div className="container mx-auto px-4">
          <div className="rounded-2xl bg-[#0A0A0A] p-8 text-center sm:p-12">
            <CheckCircle2 className="mx-auto mb-4 h-12 w-12 text-[#D4AF37]" />
            <h2 className="mb-3 text-2xl font-bold text-white sm:text-3xl">
              Ready to experience real estate differently?
            </h2>
            <p className="mx-auto mb-8 max-w-xl text-gray-400">
              Join the RealX World community and be part of a transparent,
              professional property marketplace.
            </p>
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link
                href="/listings"
                className="inline-flex w-full items-center justify-center rounded-md bg-[#D4AF37] px-8 py-3 font-semibold text-black transition-colors hover:bg-[#B8961E] sm:w-auto"
              >
                Browse Listings
              </Link>
              <Link
                href="/register"
                className="inline-flex w-full items-center justify-center rounded-md border-2 border-white px-8 py-3 font-medium text-white transition-colors hover:bg-white hover:text-black sm:w-auto"
              >
                List Your Property
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
