import { Metadata } from "next";
import Link from "next/link";
import { ClipboardList, MessageSquare, CheckSquare } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Property & Project Management — RealX World",
  description:
    "Full-cycle real estate project management from initiation to post-implementation by experienced professionals.",
};

const cards = [
  {
    icon: ClipboardList,
    title: "Technical Expertise",
    body: "Each Project Manager brings many years of sound technical experience in the built environment, ensuring every project is delivered to the highest standard.",
  },
  {
    icon: MessageSquare,
    title: "Clear Communication",
    body: "Our managers possess the ability to communicate with customers at all levels, keeping you informed and in control throughout the entire project lifecycle.",
  },
  {
    icon: CheckSquare,
    title: "Focused on Results",
    body: "With excellent organisational and planning skills, our team is laser-focused on delivering the best possible results for every valued client.",
  },
];

export default function PropertyManagementPage() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-black to-gray-900 py-16 sm:py-24">
        <div className="container mx-auto px-4 text-center">
          <h1 className="mb-4 text-3xl font-bold text-[#D4AF37] sm:text-5xl">
            Property &amp; Project Management
          </h1>
          <p className="mx-auto max-w-2xl text-base text-gray-300 sm:text-lg">
            End-to-end project delivery by experienced professionals
          </p>
        </div>
      </section>

      {/* Section 1 */}
      <section className="py-12 sm:py-16">
        <div className="container mx-auto px-4">
          <h2 className="mb-6 text-center text-2xl font-bold sm:text-3xl">
            Full-Cycle Project Management
          </h2>
          <p className="mx-auto max-w-3xl text-center text-lg text-gray-700">
            Real-X provides a world of opportunity in project management for
            clients who may not be available to take up the responsibility
            personally. We employ a team of trained and highly experienced
            professional managers in the built industry who assume full
            responsibility for the planning, managing, and controlling of all
            project resources from initiation to post-implementation support.
          </p>
        </div>
      </section>

      {/* Section 2 */}
      <section className="bg-gray-50 py-12 sm:py-16">
        <div className="container mx-auto px-4">
          <h2 className="mb-6 text-center text-2xl font-bold sm:text-3xl">
            Our Project Managers
          </h2>
          <p className="mx-auto mb-10 max-w-3xl text-center text-gray-700">
            Real-X World is highly experienced in managing major Real Estate
            projects and has worked on projects in close partnership with major
            players, customers, and third-party service providers.
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
