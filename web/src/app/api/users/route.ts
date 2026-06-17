import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthenticatedUser } from "@/lib/auth";
import { createUserSchema, userListSchema } from "@/lib/schemas";
import { Role } from "@prisma/client";
import bcrypt from "bcryptjs";

export async function GET(req: NextRequest) {
  const user = await getAuthenticatedUser(req);
  if (!user || user.role !== Role.SUPER_ADMIN) {
    return NextResponse.json(
      { error: { code: "FORBIDDEN", message: "Super-Admin access required." } },
      { status: user ? 403 : 401 }
    );
  }

  const params = Object.fromEntries(req.nextUrl.searchParams.entries());
  const parsed = userListSchema.safeParse(params);
  if (!parsed.success) {
    return NextResponse.json(
      { error: { code: "VALIDATION_ERROR", message: parsed.error.errors[0].message } },
      { status: 400 }
    );
  }

  const { page, pageSize, search, role: roleFilter, sortBy, sortOrder } = parsed.data;
  const skip = (page - 1) * pageSize;

  const where = {
    ...(roleFilter ? { role: roleFilter } : {}),
    ...(search
      ? {
          OR: [
            { fullName: { contains: search, mode: "insensitive" as const } },
            { email: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  const orderBy = sortBy ? { [sortBy]: sortOrder } : { createdAt: sortOrder as "asc" | "desc" };

  const [data, total] = await Promise.all([
    db.user.findMany({
      where,
      orderBy,
      skip,
      take: pageSize,
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        disabled: true,
        mustChangePassword: true,
        lastSignInAt: true,
        createdAt: true,
      },
    }),
    db.user.count({ where }),
  ]);

  return NextResponse.json({ data, total, page, pageSize });
}

export async function POST(req: NextRequest) {
  const user = await getAuthenticatedUser(req);
  if (!user || user.role !== Role.SUPER_ADMIN) {
    return NextResponse.json(
      { error: { code: "FORBIDDEN", message: "Super-Admin access required." } },
      { status: user ? 403 : 401 }
    );
  }

  const body = await req.json().catch(() => null);
  const parsed = createUserSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: { code: "VALIDATION_ERROR", message: parsed.error.errors[0].message } },
      { status: 400 }
    );
  }

  const existing = await db.user.findUnique({ where: { email: parsed.data.email } });
  if (existing) {
    return NextResponse.json(
      { error: { code: "EMAIL_IN_USE", message: "A user with this email already exists." } },
      { status: 409 }
    );
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 12);
  const newUser = await db.user.create({
    data: {
      email: parsed.data.email,
      fullName: parsed.data.fullName,
      role: parsed.data.role,
      passwordHash,
    },
    select: { id: true, email: true, fullName: true, role: true, createdAt: true },
  });

  return NextResponse.json(newUser, { status: 201 });
}
