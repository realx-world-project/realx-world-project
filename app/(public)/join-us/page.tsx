import { Metadata } from "next";
import { FileText, Search, CheckCircle2, TrendingUp, Shield, Award, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import JoinUsForm from "./join-us-client";

export const metadata: Metadata = {
  title: "Join Us — RealX World",
  description:
    "Join the RealX World team as an agent or broker and be part of Nigeria's most transparent real estate marketplace.",
};

const howItWorks = [
  {
    step: "1",
    icon: FileText,
    title: "Submit Your Application",
    body: "Complete the BioData form below with your personal and professional details. This serves as your expression of interest to join the RealX World team.",
  },
  {
    step: "2",
    icon: Search,
    title: "Verification",
    body: "Your application is reviewed by management. We verify your credentials and professional background before making a decision.",
  },
  {
    step: "3",
    icon: CheckCircle2,
    title: "Approval",
    body: "Approved applicants join as agents for a minimum period of one year, after which they may be considered for a broker position upon request.",
  },
  {
    step: "4",
    icon: TrendingUp,
    title: "Continued Development",
    body: "All team members undergo regulated, periodic Mandatory Continued Capacity Development to remain on the team and maintain professional standards.",
  },
];

const requirements = [
  {
    icon: Shield,
    title: "Professional Ethics",
    body: "Agents are expected to uphold our ethics at all times and ensure the platform is not used for any irregular or untoward activities.",
  },
  {
    icon: Award,
    title: "Capacity Development",
    body: "All agents and brokers undergo Mandatory Continued Capacity Development, tailored and periodic, to qualify them to remain on the team.",
  },
  {
    icon: Users,
    title: "Team Commitment",
    body: "You will be joining a team of accomplished professionals drawn from diverse fields within the built environment industry.",
  },
];

export default function JoinUsPage() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-black to-gray-900 py-16 sm:py-24">
        <div className="container mx-auto px-4 text-center">
          <h1 className="mb-4 text-3xl font-bold text-[#D4AF37] sm:text-5xl">
            Join the RealX World Team
          </h1>
          <p className="mx-auto max-w-2xl text-base text-gray-300 sm:text-lg">
            Become part of Nigeria's most transparent real estate marketplace
          </p>
        </div>
      </section>

      {/* Introduction */}
      <section className="py-12 sm:py-16">
        <div className="container mx-auto px-4">
          <p className="mx-auto max-w-3xl text-center text-lg text-gray-700">
            All RealX World agents join the company through our Join Us link. Completing the
            form below serves as your expression of interest to join our team. Each
            application is subject to approval by management after due verification.
          </p>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-gray-50 py-12 sm:py-16">
        <div className="container mx-auto px-4">
          <div className="mb-10 text-center">
            <h2 className="text-2xl font-bold sm:text-3xl">How It Works</h2>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {howItWorks.map((item) => {
              const Icon = item.icon;
              return (
                <Card key={item.step} className="border-t-2 border-[#D4AF37] shadow-sm">
                  <CardContent className="pt-6 pb-6">
                    <div className="mb-4 flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#D4AF37] text-sm font-bold text-black">
                        {item.step}
                      </div>
                      <Icon className="h-6 w-6 text-[#D4AF37]" />
                    </div>
                    <h3 className="mb-2 text-lg font-semibold">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">{item.body}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Requirements */}
      <section className="py-12 sm:py-16">
        <div className="container mx-auto px-4">
          <div className="mb-10 text-center">
            <h2 className="text-2xl font-bold sm:text-3xl">What We Expect</h2>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            {requirements.map((req) => {
              const Icon = req.icon;
              return (
                <Card key={req.title} className="border-t-2 border-[#D4AF37] shadow-sm">
                  <CardContent className="pt-6 pb-6">
                    <Icon className="mb-4 h-8 w-8 text-[#D4AF37]" />
                    <h3 className="mb-2 text-lg font-semibold">{req.title}</h3>
                    <p className="text-sm text-muted-foreground">{req.body}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Application Form */}
      <section className="bg-gray-50 py-12 sm:py-16">
        <div className="container mx-auto px-4">
          <div className="mb-10 text-center">
            <h2 className="text-2xl font-bold sm:text-3xl">Apply to Join RealX World</h2>
            <p className="mt-2 text-muted-foreground">
              Fill in your details below and our team will be in touch.
            </p>
          </div>

          <JoinUsForm />
        </div>
      </section>
    </div>
  );
}
