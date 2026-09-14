import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getSettings } from "@/lib/settings";
import SettingsClient from "./settings-client";

export default async function AdminSettingsPage() {
  const session = await auth();
  if (!session || (session.user as any).role !== "ADMIN") redirect("/login");

  const settings = await getSettings([
    "LISTING_FEE",
    "ENQUIRY_FEE",
    "COMMISSION_RATE",
    "PAYMENTS_ENABLED",
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold sm:text-3xl">Platform Settings</h1>
        <p className="mt-1 text-muted-foreground">Configure fees, commission, and payment activation</p>
      </div>

      <SettingsClient initialSettings={settings} />
    </div>
  );
}
