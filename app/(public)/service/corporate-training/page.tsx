import { Metadata } from "next";
import Link from "next/link";
import { BookOpen, Monitor, Award } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Corporate Training — RealX World",
  description:
    "Tailored training programmes for client staff on Real-X World products, services, and software.",
};

const cards = [
  {
    icon: BookOpen,
    title: "Needs-Based Curriculum",
    body: "Training content is tailored specifically to your organisation's software and operational requirements.",
  },
  {
    icon: Monitor,
    title: "Product & Software Training",
    body: "Hands-on training on all Real-X World products, platforms, and services to maximise your team's efficiency.",
  },
  {
    icon: Award,
    title: "Certified Competence",
    body: "Upon completion, staff are fully equipped and certified to operate Real-X World tools within your organisation.",
  },
];

export default function CorporateTrainingPage() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-black to-gray-900 py-16 sm:py-24">
        <div className="container mx-auto px-4 text-center">
          <h1 className="mb-4 text-3xl font-bold text-[#D4AF37] sm:text-5xl">
            Corporate Training
          </h1>
          <p className="mx-auto max-w-2xl text-base text-gray-300 sm:text-lg">
            Empowering your team with the knowledge to succeed
          </p>
        </div>
      </section>

      {/* Section 1 */}
      <section className="py-12 sm:py-16">
        <div className="container mx-auto px-4">
          <h2 className="mb-6 text-center text-2xl font-bold sm:text-3xl">
            Tailored Training Programmes
          </h2>
          <p className="mx-auto max-w-3xl text-center text-lg text-gray-700">
            Our Corporate Training programme is designed to meet our
            clients&apos; specific software and maintenance needs by training
            their staff and personnel on the use of services and products
            provided by Real-X World. We deliver structured, hands-on training
            that equips your team with the skills needed to maximise every
            Real-X World tool and service.
          </p>
        </div>
      </section>

      {/* Section 2 */}
      <section className="bg-gray-50 py-12 sm:py-16">
        <div className="container mx-auto px-4">
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
