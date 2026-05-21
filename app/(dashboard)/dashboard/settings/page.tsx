import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import SettingsClient from "./settings-client";

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const userEmail = session.user.email ?? "";
  const userRole = (session.user as any).role ?? "BUYER";

  return <SettingsClient email={userEmail} role={userRole} />;
}
