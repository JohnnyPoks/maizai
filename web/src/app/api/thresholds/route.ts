import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { createThresholdSchema } from "@/lib/schemas";
import { Role } from "@prisma/client";

export async function GET() {
  const thresholds = await db.ruleThreshold.findMany({
    orderBy: [{ diseaseClass: "asc" }, { createdAt: "asc" }],
  });
  return NextResponse.json(thresholds);
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
  const parsed = createThresholdSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: { code: "VALIDATION_ERROR", message: parsed.error.errors[0].message } },
      { status: 400 }
    );
  }

  const threshold = await db.ruleThreshold.create({ data: parsed.data });
  return NextResponse.json(threshold, { status: 201 });
}
