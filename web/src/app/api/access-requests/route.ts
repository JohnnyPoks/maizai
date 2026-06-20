import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthenticatedUser } from "@/lib/auth";
import { accessRequestSchema, accessRequestListSchema } from "@/lib/schemas";
import { notifySuperAdminOfAccessRequest } from "@/lib/email";
import { Role } from "@prisma/client";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = accessRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: { code: "VALIDATION_ERROR", message: parsed.error.errors[0].message } },
      { status: 400 }
    );
  }

  const { fullName, email, affiliation, reason } = parsed.data;

  const existingUser = await db.user.findUnique({ where: { email } });
  if (existingUser) {
    return NextResponse.json(
      { error: { code: "EMAIL_IN_USE", message: "This email is already registered. Please sign in instead." } },
      { status: 409 }
    );
  }

  const existing = await db.accessRequest.findFirst({
    where: { email, status: "PENDING" },
  });
  if (existing) {
    return NextResponse.json(
      { error: { code: "PENDING_EXISTS", message: "You already have a pending request for this email." } },
      { status: 409 }
    );
  }

  const request = await db.accessRequest.create({
    data: { fullName, email, affiliation, reason },
  });

  await notifySuperAdminOfAccessRequest({
    fullName,
    email,
    affiliation: affiliation ?? null,
    reason,
    id: request.id,
  }).catch(console.error);

  return NextResponse.json({ id: request.id }, { status: 201 });
}

export async function GET(req: NextRequest) {
  const user = await getAuthenticatedUser(req);
  if (!user || user.role !== Role.SUPER_ADMIN) {
    return NextResponse.json(
      { error: { code: "FORBIDDEN", message: "Super-Admin access required." } },
      { status: user ? 403 : 401 }
    );
  }

  const params = Object.fromEntries(req.nextUrl.searchParams.entries());
  const parsed = accessRequestListSchema.safeParse(params);
  if (!parsed.success) {
    return NextResponse.json(
      { error: { code: "VALIDATION_ERROR", message: parsed.error.errors[0].message } },
      { status: 400 }
    );
  }

  const { page, pageSize, sortBy, sortOrder, status, from, to } = parsed.data;
  const skip = (page - 1) * pageSize;

  const where = {
    ...(status ? { status } : {}),
    ...(from || to
      ? {
          requestedAt: {
            ...(from ? { gte: new Date(from) } : {}),
            ...(to ? { lte: new Date(to) } : {}),
          },
        }
      : {}),
  };

  const orderBy = sortBy
    ? { [sortBy]: sortOrder }
    : { requestedAt: sortOrder as "asc" | "desc" };

  const [data, total] = await Promise.all([
    db.accessRequest.findMany({ where, orderBy, skip, take: pageSize }),
    db.accessRequest.count({ where }),
  ]);

  return NextResponse.json({ data, total, page, pageSize });
}
