import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function GET() {
  const session = await auth();
  return NextResponse.json({ 
    session: session ? { 
      userId: session.user?.id, 
      role: (session.user as any)?.role,
      email: session.user?.email 
    } : null 
  });
}
