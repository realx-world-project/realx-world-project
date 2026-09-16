import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import SettingsClient from "./settings-client";

export default async function SettingsPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const db: any = prisma;
  const user = await db.user.findUnique({
    where: { id: session.user.id as string },
    include: { upgradeRequest: true },
  });

  if (!user) redirect("/login");

  return (
    <SettingsClient
      email={user.email}
      role={user.role}
      isActive={user.isActive}
      upgradeRequest={
        user.upgradeRequest
          ? {
              status: user.upgradeRequest.status,
              reason: user.upgradeRequest.reason,
              adminNote: user.upgradeRequest.adminNote,
              createdAt: user.upgradeRequest.createdAt.toISOString(),
            }
          : null
      }
    />
  );
}
