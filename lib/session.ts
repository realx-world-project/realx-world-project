import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export const getServerSession = async () => await auth();

export async function requireRole(allowedRoles: string[], req?: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!allowedRoles.includes((session.user as any).role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return session;
}
