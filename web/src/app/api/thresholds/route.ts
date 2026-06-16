import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { updateThresholdSchema } from "@/lib/schemas";
import { Role } from "@prisma/client";

export async function GET() {
  try {
    const thresholds = await db.ruleThreshold.findMany({
      where: { active: true },
      orderBy: [{ diseaseClass: "asc" }, { createdAt: "asc" }],
    });
    return NextResponse.json(thresholds);
  } catch {
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to fetch thresholds." } },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await auth();
    const userRole = (session?.user as { role?: string } | null)?.role;
    if (!session?.user?.id || userRole !== Role.ADMIN) {
      return NextResponse.json(
        { error: { code: "FORBIDDEN", message: "Admin access required." } },
        { status: 403 }
      );
    }

    const body = await req.json();
    const parsed = updateThresholdSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: parsed.error.issues[0].message } },
        { status: 400 }
      );
    }

    const threshold = await db.ruleThreshold.update({
      where: { id: parsed.data.id },
      data: {
        minValue: parsed.data.minValue,
        maxValue: parsed.data.maxValue,
        urgencyLevel: parsed.data.urgencyLevel as "LOW" | "MEDIUM" | "HIGH",
        adviceType: parsed.data.adviceType,
        adviceText: parsed.data.adviceText,
        active: parsed.data.active,
      },
    });

    return NextResponse.json(threshold);
  } catch {
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to update threshold." } },
      { status: 500 }
    );
  }
}
