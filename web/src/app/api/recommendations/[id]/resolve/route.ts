import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json(
      { error: { code: "UNAUTHORIZED", message: "Authentication required." } },
      { status: 401 }
    );
  }

  const { id } = await params;
  const rec = await db.recommendation.findUnique({ where: { id } });
  if (!rec) {
    return NextResponse.json(
      { error: { code: "NOT_FOUND", message: "Recommendation not found." } },
      { status: 404 }
    );
  }

  const updated = await db.recommendation.update({
    where: { id },
    data: { resolvedAt: rec.resolvedAt ? null : new Date() },
  });

  return NextResponse.json({ id: updated.id, resolvedAt: updated.resolvedAt });
}
