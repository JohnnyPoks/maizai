import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { approveAccessRequestSchema } from "@/lib/schemas";
import { notifyRequesterApproved } from "@/lib/email";
import { Role } from "@prisma/client";
import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  const role = (session?.user as unknown as { role?: string } | null)?.role;
  if (!session?.user || role !== Role.SUPER_ADMIN) {
    return NextResponse.json(
      { error: { code: "FORBIDDEN", message: "Super-Admin access required." } },
      { status: 403 }
    );
  }

  const { id } = await params;
  const body = await req.json().catch(() => null);
  const parsed = approveAccessRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: { code: "VALIDATION_ERROR", message: parsed.error.errors[0].message } },
      { status: 400 }
    );
  }

  const request = await db.accessRequest.findUnique({ where: { id } });
  if (!request) {
    return NextResponse.json(
      { error: { code: "NOT_FOUND", message: "Access request not found." } },
      { status: 404 }
    );
  }
  if (request.status !== "PENDING") {
    return NextResponse.json(
      { error: { code: "ALREADY_REVIEWED", message: "This request has already been reviewed." } },
      { status: 409 }
    );
  }

  const tempPassword = randomBytes(8).toString("hex");
  const passwordHash = await bcrypt.hash(tempPassword, 12);

  const [, updatedRequest] = await db.$transaction([
    db.user.upsert({
      where: { email: request.email },
      update: {
        fullName: request.fullName,
        role: parsed.data.approvedRole,
        passwordHash,
        mustChangePassword: true,
        disabled: false,
      },
      create: {
        email: request.email,
        fullName: request.fullName,
        role: parsed.data.approvedRole,
        passwordHash,
        mustChangePassword: true,
      },
    }),
    db.accessRequest.update({
      where: { id },
      data: {
        status: "APPROVED",
        reviewedAt: new Date(),
        reviewedBy: session.user.id,
        notes: parsed.data.notes,
        approvedRole: parsed.data.approvedRole,
      },
    }),
  ]);

  await notifyRequesterApproved({
    fullName: request.fullName,
    email: request.email,
    tempPassword,
  }).catch(console.error);

  return NextResponse.json({ id: updatedRequest.id, status: "APPROVED" });
}
