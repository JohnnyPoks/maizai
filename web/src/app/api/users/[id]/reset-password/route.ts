import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthenticatedUser } from "@/lib/auth";
import { Role } from "@prisma/client";
import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAuthenticatedUser(req);
  if (!user || user.role !== Role.SUPER_ADMIN) {
    return NextResponse.json(
      { error: { code: "FORBIDDEN", message: "Super-Admin access required." } },
      { status: user ? 403 : 401 }
    );
  }

  const { id } = await params;
  const target = await db.user.findUnique({ where: { id } });
  if (!target) {
    return NextResponse.json(
      { error: { code: "NOT_FOUND", message: "User not found." } },
      { status: 404 }
    );
  }

  const tempPassword = randomBytes(8).toString("hex");
  const passwordHash = await bcrypt.hash(tempPassword, 12);

  await db.user.update({
    where: { id },
    data: { passwordHash, mustChangePassword: true },
  });

  // Return the temp password so the admin can relay it to the user directly.
  return NextResponse.json({ success: true, tempPassword });
}
