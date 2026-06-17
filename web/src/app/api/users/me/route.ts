import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthenticatedUser } from "@/lib/auth";
import { updateOwnProfileSchema } from "@/lib/schemas";
import { Role } from "@prisma/client";

export async function PATCH(req: NextRequest) {
  const user = await getAuthenticatedUser(req);
  if (!user) {
    return NextResponse.json(
      { error: { code: "UNAUTHORIZED", message: "Authentication required." } },
      { status: 401 }
    );
  }

  const body = await req.json().catch(() => null);
  const parsed = updateOwnProfileSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: { code: "VALIDATION_ERROR", message: parsed.error.errors[0].message } },
      { status: 400 }
    );
  }

  // Only Super-Admin can change email.
  if (parsed.data.email && user.role !== Role.SUPER_ADMIN) {
    return NextResponse.json(
      { error: { code: "FORBIDDEN", message: "Only Super-Admin can change email address." } },
      { status: 403 }
    );
  }

  const updated = await db.user.update({
    where: { id: user.id },
    data: parsed.data,
    select: { id: true, email: true, fullName: true, role: true },
  });

  return NextResponse.json(updated);
}
