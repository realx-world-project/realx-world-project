import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

const createSchema = z.object({ name: z.string().min(2), fileUrl: z.string().url(), publicId: z.string() });
const deleteSchema = z.object({ credentialId: z.string() });

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = params;
  const db: any = prisma;
  const prof = await db.professional.findUnique({ where: { id } });
  if (!prof) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (prof.userId !== (session.user.id as string)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await request.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues }, { status: 400 });

  const cred = await db.professionalCredential.create({
    data: {
      professionalId: id,
      name: parsed.data.name,
      fileUrl: parsed.data.fileUrl,
      publicId: parsed.data.publicId,
    },
  });

  await prisma.auditLog.create({
    data: {
      userId: session.user.id as string,
      action: "CREDENTIAL_ADDED",
      entity: "ProfessionalCredential",
      entityId: cred.id,
      meta: {},
    },
  });

  return NextResponse.json(cred, { status: 201 });
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = params; // professional id
  const db: any = prisma;
  const body = await request.json();
  const parsed = deleteSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues }, { status: 400 });

  const prof = await db.professional.findUnique({ where: { id } });
  if (!prof) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (prof.userId !== (session.user.id as string)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const credential = await db.professionalCredential.findUnique({ where: { id: parsed.data.credentialId } });
  if (!credential || credential.professionalId !== id) return NextResponse.json({ error: "Credential not found" }, { status: 404 });

  await db.professionalCredential.delete({ where: { id: parsed.data.credentialId } });

  await prisma.auditLog.create({
    data: {
      userId: session.user.id as string,
      action: "CREDENTIAL_REMOVED",
      entity: "ProfessionalCredential",
      entityId: parsed.data.credentialId,
      meta: {},
    },
  });

  return NextResponse.json({ success: true });
}
