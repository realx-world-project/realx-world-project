"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import Link from "next/link";
import { CheckCircle2, XCircle, Mail } from "lucide-react";
import { AuthCard } from "@/components/forms/AuthCard";
import { Button } from "@/components/ui/button";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const success = searchParams.get("success");
  const error = searchParams.get("error");

  if (success === "true") {
    return (
      <AuthCard title="">
        <div className="flex flex-col items-center gap-4 text-center">
          <CheckCircle2 className="h-14 w-14 text-green-500" />
          <h2 className="text-xl font-bold text-[#0A0A0A]">Email Verified!</h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            Your email address has been verified successfully. You can now access
            all features of RealX World.
          </p>
          <Button asChild className="mt-2 w-full bg-[#D4AF37] text-black font-bold hover:bg-[#b8952e]">
            <Link href="/dashboard">Go to Dashboard</Link>
          </Button>
        </div>
      </AuthCard>
    );
  }

  if (error === "invalid") {
    return (
      <AuthCard title="">
        <div className="flex flex-col items-center gap-4 text-center">
          <XCircle className="h-14 w-14 text-red-500" />
          <h2 className="text-xl font-bold text-[#0A0A0A]">Link Expired</h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            This verification link has expired or is invalid. Request a new
            verification email from your profile page.
          </p>
          <Button asChild className="mt-2 w-full bg-[#D4AF37] text-black font-bold hover:bg-[#b8952e]">
            <Link href="/dashboard/profile">Go to Profile</Link>
          </Button>
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard title="">
      <div className="flex flex-col items-center gap-4 text-center">
        <Mail className="h-14 w-14 text-[#D4AF37]" />
        <h2 className="text-xl font-bold text-[#0A0A0A]">Check Your Email</h2>
        <p className="text-sm text-gray-600 leading-relaxed">
          We sent a verification link to your email address. Click the link in
          the email to verify your account. The link expires in 24 hours.
        </p>
        <p className="text-xs text-gray-400">
          Check your spam folder if it does not arrive within 5 minutes.
        </p>
        <Link href="/dashboard" className="mt-2 text-sm text-[#D4AF37] hover:underline">
          ← Back to Dashboard
        </Link>
      </div>
    </AuthCard>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense>
      <VerifyEmailContent />
    </Suspense>
  );
}
