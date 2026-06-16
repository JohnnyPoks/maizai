import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { updateOwnProfileSchema } from "@/lib/schemas";
import { Role } from "@prisma/client";

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
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

  const role = (session.user as unknown as { role?: string })?.role;

  // Only Super-Admin can change email
  if (parsed.data.email && role !== Role.SUPER_ADMIN) {
    return NextResponse.json(
      { error: { code: "FORBIDDEN", message: "Only Super-Admin can change email address." } },
      { status: 403 }
    );
  }

  const updated = await db.user.update({
    where: { id: session.user.id },
    data: parsed.data,
    select: { id: true, email: true, fullName: true, role: true },
  });

  return NextResponse.json(updated);
}
