import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { loginSchema } from "@/lib/schemas";
import { encodeMobileToken } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: { code: "VALIDATION_ERROR", message: parsed.error.issues[0].message } },
      { status: 400 }
    );
  }

  const user = await db.user.findUnique({
    where: { email: parsed.data.email.toLowerCase().trim() },
  });

  // Unified error message prevents email enumeration.
  if (!user || user.disabled) {
    return NextResponse.json(
      { error: { code: "INVALID_CREDENTIALS", message: "Invalid e-mail address or password." } },
      { status: 401 }
    );
  }

  const valid = await bcrypt.compare(parsed.data.password, user.passwordHash);
  if (!valid) {
    return NextResponse.json(
      { error: { code: "INVALID_CREDENTIALS", message: "Invalid e-mail address or password." } },
      { status: 401 }
    );
  }

  await db.user.update({
    where: { id: user.id },
    data: { lastSignInAt: new Date() },
  });

  const token = await encodeMobileToken({
    id: user.id,
    email: user.email,
    name: user.fullName,
    role: user.role,
    mustChangePassword: user.mustChangePassword,
  });

  return NextResponse.json({
    token,
    user: {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
    },
    mustChangePassword: user.mustChangePassword,
  });
}
