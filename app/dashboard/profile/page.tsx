import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ProfileClient from "./profile-client";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const session = await auth();
  if (!session) redirect("/login");
  const userId = session.user.id as string;
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      name: true,
      phone: true,
      email: true,
      role: true,
      createdAt: true,
      isVerified: true,
    },
  });
  return (
    <ProfileClient
      initialName={user?.name ?? session.user.name ?? ""}
      initialPhone={user?.phone ?? ""}
      email={user?.email ?? session.user.email ?? ""}
      role={user?.role ?? (session.user as any).role ?? ""}
      createdAt={user?.createdAt?.toISOString() ?? ""}
      isVerified={user?.isVerified ?? false}
    />
  );
}
