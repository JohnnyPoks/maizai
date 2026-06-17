import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthenticatedUser } from "@/lib/auth";
import { updateUserSchema } from "@/lib/schemas";
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
  const parsed = updateUserSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: { code: "VALIDATION_ERROR", message: parsed.error.errors[0].message } },
      { status: 400 }
    );
  }

  const target = await db.user.findUnique({ where: { id } });
  if (!target) {
    return NextResponse.json(
      { error: { code: "NOT_FOUND", message: "User not found." } },
      { status: 404 }
    );
  }

  const updated = await db.user.update({
    where: { id },
    data: parsed.data,
    select: { id: true, email: true, fullName: true, role: true, disabled: true, updatedAt: true },
  });

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

  if (id === user.id) {
    return NextResponse.json(
      { error: { code: "CANNOT_DELETE_SELF", message: "You cannot delete your own account." } },
      { status: 400 }
    );
  }

  await db.user.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
