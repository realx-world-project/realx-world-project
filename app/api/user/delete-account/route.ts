import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function POST() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = session.user.id as string;
  const db: any = prisma;

  try {
    // Most relations on User (listings, payments, audit logs, etc.) are NOT
    // set to cascade-delete in the schema — and shouldn't be, since wiping
    // payment/listing history on account deletion would destroy financial
    // and moderation records other users and admins depend on. So: if this
    // user has real activity (listings or payments), deactivate and scrub
    // personal data instead of a hard delete. Only a user with no such
    // history is actually removed from the database.
    const [listingsCount, paymentsCount] = await Promise.all([
      db.listing.count({ where: { userId } }),
      db.payment.count({ where: { userId } }),
    ]);

    if (listingsCount > 0 || paymentsCount > 0) {
      await db.user.update({
        where: { id: userId },
        data: {
          isActive: false,
          email: `deleted-${userId}@realxworld.net`,
          name: "Deleted User",
          phone: null,
          passwordHash: null,
        },
      });
    } else {
      await db.$transaction([
        db.savedListing.deleteMany({ where: { userId } }),
        db.enquiry.deleteMany({ where: { buyerId: userId } }),
        db.roleUpgradeRequest.deleteMany({ where: { userId } }),
        db.kycVerification.deleteMany({ where: { userId } }),
        db.auditLog.deleteMany({ where: { userId } }),
        db.user.delete({ where: { id: userId } }),
      ]);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[delete-account] error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
