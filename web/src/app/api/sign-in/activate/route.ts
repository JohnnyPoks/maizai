import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { z } from "zod";

const schema = z.object({ email: z.string().email() });

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const email = parsed.data.email.toLowerCase().trim();

  const request = await db.accessRequest.findFirst({
    where: { email, status: "APPROVED" },
    orderBy: { requestedAt: "desc" },
  });

  if (!request || !request.tempPassword || !request.approvedRole) {
    return NextResponse.json(
      { error: "No approved request found or already activated." },
      { status: 404 }
    );
  }

  const passwordHash = await bcrypt.hash(request.tempPassword, 12);

  await db.$transaction([
    db.user.upsert({
      where: { email },
      update: {
        fullName: request.fullName,
        role: request.approvedRole,
        passwordHash,
        mustChangePassword: true,
        disabled: false,
      },
      create: {
        email,
        fullName: request.fullName,
        role: request.approvedRole,
        passwordHash,
        mustChangePassword: true,
      },
    }),
    db.accessRequest.update({
      where: { id: request.id },
      data: { tempPassword: null },
    }),
  ]);

  return NextResponse.json({ success: true });
}
