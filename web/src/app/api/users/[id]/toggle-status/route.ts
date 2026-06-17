import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthenticatedUser } from "@/lib/auth";
import { Role } from "@prisma/client";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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
      { error: { code: "CANNOT_DISABLE_SELF", message: "You cannot disable your own account." } },
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
    data: { disabled: !target.disabled },
    select: { id: true, disabled: true },
  });

  return NextResponse.json(updated);
}
