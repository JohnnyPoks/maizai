import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthenticatedUser } from "@/lib/auth";
import { patchThresholdSchema } from "@/lib/schemas";
import { Role } from "@prisma/client";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAuthenticatedUser(req);
  if (!user || user.role !== Role.SUPER_ADMIN) {
    return NextResponse.json(
      { error: { code: "FORBIDDEN", message: "Super-Admin access required." } },
      { status: user ? 403 : 401 }
    );
  }

  const { id } = await params;
  const body = await req.json().catch(() => null);
  const parsed = patchThresholdSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: { code: "VALIDATION_ERROR", message: parsed.error.errors[0].message } },
      { status: 400 }
    );
  }

  const threshold = await db.ruleThreshold.findUnique({ where: { id } });
  if (!threshold) {
    return NextResponse.json(
      { error: { code: "NOT_FOUND", message: "Threshold not found." } },
      { status: 404 }
    );
  }

  const updated = await db.ruleThreshold.update({ where: { id }, data: parsed.data });
  return NextResponse.json(updated);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAuthenticatedUser(req);
  if (!user || user.role !== Role.SUPER_ADMIN) {
    return NextResponse.json(
      { error: { code: "FORBIDDEN", message: "Super-Admin access required." } },
      { status: user ? 403 : 401 }
    );
  }

  const { id } = await params;
  await db.ruleThreshold.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
