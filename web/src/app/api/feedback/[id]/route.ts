import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthenticatedUser } from "@/lib/auth";
import { Role } from "@prisma/client";

// Toggle a feedback item between NEW and RESOLVED (admins only).
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAuthenticatedUser(req);
  if (!user || (user.role !== Role.ADMIN && user.role !== Role.SUPER_ADMIN)) {
    return NextResponse.json(
      { error: { code: "FORBIDDEN", message: "Admin access required." } },
      { status: user ? 403 : 401 }
    );
  }

  const { id } = await params;
  const existing = await db.feedback.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json(
      { error: { code: "NOT_FOUND", message: "Feedback not found." } },
      { status: 404 }
    );
  }

  const updated = await db.feedback.update({
    where: { id },
    data: { status: existing.status === "RESOLVED" ? "NEW" : "RESOLVED" },
  });
  return NextResponse.json({ id: updated.id, status: updated.status });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAuthenticatedUser(req);
  if (!user || (user.role !== Role.ADMIN && user.role !== Role.SUPER_ADMIN)) {
    return NextResponse.json(
      { error: { code: "FORBIDDEN", message: "Admin access required." } },
      { status: user ? 403 : 401 }
    );
  }

  const { id } = await params;
  await db.feedback.delete({ where: { id } }).catch(() => null);
  return NextResponse.json({ success: true });
}
