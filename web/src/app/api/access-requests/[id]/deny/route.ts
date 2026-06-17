import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthenticatedUser } from "@/lib/auth";
import { denyAccessRequestSchema } from "@/lib/schemas";
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
  const body = await req.json().catch(() => null);
  const parsed = denyAccessRequestSchema.safeParse(body ?? {});
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

  const updated = await db.accessRequest.update({
    where: { id },
    data: {
      status: "DENIED",
      reviewedAt: new Date(),
      reviewedBy: user.id,
      notes: parsed.data.notes,
    },
  });

  return NextResponse.json({ id: updated.id, status: "DENIED" });
}
