import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthenticatedUser } from "@/lib/auth";
import { changePasswordSchema, setPasswordSchema } from "@/lib/schemas";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  const user = await getAuthenticatedUser(req);
  if (!user) {
    return NextResponse.json(
      { error: { code: "UNAUTHORIZED", message: "Authentication required." } },
      { status: 401 }
    );
  }

  const body = await req.json().catch(() => null);

  if (user.mustChangePassword) {
    // On forced password change only the new password is required.
    const parsed = setPasswordSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: parsed.error.errors[0].message } },
        { status: 400 }
      );
    }

    const hash = await bcrypt.hash(parsed.data.newPassword, 12);
    await db.user.update({
      where: { id: user.id },
      data: { passwordHash: hash, mustChangePassword: false },
    });
    return NextResponse.json({ success: true, mustChangePassword: false });
  }

  const parsed = changePasswordSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: { code: "VALIDATION_ERROR", message: parsed.error.errors[0].message } },
      { status: 400 }
    );
  }

  const dbUser = await db.user.findUnique({ where: { id: user.id } });
  if (!dbUser) {
    return NextResponse.json(
      { error: { code: "NOT_FOUND", message: "User not found." } },
      { status: 404 }
    );
  }

  const valid = await bcrypt.compare(parsed.data.currentPassword, dbUser.passwordHash);
  if (!valid) {
    return NextResponse.json(
      { error: { code: "WRONG_PASSWORD", message: "Current password is incorrect." } },
      { status: 400 }
    );
  }

  const hash = await bcrypt.hash(parsed.data.newPassword, 12);
  await db.user.update({
    where: { id: user.id },
    data: { passwordHash: hash },
  });

  return NextResponse.json({ success: true });
}
