"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Search, Building2, Loader2 } from "lucide-react";
import { AuthCard } from "@/components/forms/AuthCard";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

type RoleOption = "BUYER" | "SELLER";

const roleOptions: {
  value: RoleOption;
  icon: typeof Search;
  title: string;
  description: string;
}[] = [
  {
    value: "BUYER",
    icon: Search,
    title: "I'm Looking to Buy or Rent",
    description:
      "Browse verified property listings, save favourites, and connect with sellers across Nigeria.",
  },
  {
    value: "SELLER",
    icon: Building2,
    title: "I Want to List a Property",
    description:
      "List properties for sale or rent, manage your listings, and connect with serious buyers.",
  },
];

export default function OnboardingRolePage() {
  const { status, update } = useSession();
  const router = useRouter();
  const [selected, setSelected] = useState<RoleOption | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  const onSubmit = async () => {
    if (!selected) return;
    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/onboarding", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: selected }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to save your role");
      }

      // Refresh the JWT so needsOnboarding/role are current without a re-login.
      await update({ role: selected });
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (status === "loading" || status === "unauthenticated") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-[#D4AF37]" />
      </div>
    );
  }

  return (
    <AuthCard title="Welcome to RealX World!" subtitle="Tell us how you plan to use the platform">
      <div className="space-y-4">
        {roleOptions.map((opt) => {
          const Icon = opt.icon;
          const isSelected = selected === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => setSelected(opt.value)}
              className={cn(
                "w-full rounded-lg border-2 bg-white p-4 text-left shadow-sm transition-colors",
                isSelected ? "border-[#D4AF37] bg-[#D4AF37]/5" : "border-gray-200 hover:border-gray-300"
              )}
            >
              <div className="flex items-start gap-3">
                <div
                  className={cn(
                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
                    isSelected ? "bg-[#D4AF37] text-black" : "bg-gray-100 text-gray-600"
                  )}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold text-[#0A0A0A]">{opt.title}</p>
                  <p className="mt-1 text-sm text-gray-500">{opt.description}</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {error && (
        <Alert variant="destructive" className="mt-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Button
        type="button"
        onClick={onSubmit}
        disabled={!selected || isSubmitting}
        className="mt-6 w-full bg-[#D4AF37] hover:bg-[#B8961E] text-black font-semibold"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Saving...
          </>
        ) : (
          "Continue"
        )}
      </Button>
    </AuthCard>
  );
}
