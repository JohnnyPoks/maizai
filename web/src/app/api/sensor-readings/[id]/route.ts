import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { Role } from "@prisma/client";

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  const role = (session?.user as unknown as { role?: string } | null)?.role;
  if (!session?.user || role !== Role.SUPER_ADMIN) {
    return NextResponse.json(
      { error: { code: "FORBIDDEN", message: "Super-Admin access required." } },
      { status: 403 }
    );
  }

  const { id } = await params;
  const reading = await db.sensorReading.findUnique({ where: { id } });
  if (!reading) {
    return NextResponse.json(
      { error: { code: "NOT_FOUND", message: "Sensor reading not found." } },
      { status: 404 }
    );
  }

  await db.sensorReading.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
