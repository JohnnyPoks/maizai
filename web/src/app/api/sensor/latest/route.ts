import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json(
        { error: { code: "UNAUTHORIZED", message: "Authentication required." } },
        { status: 401 }
      );
    }

    const nodeId = req.nextUrl.searchParams.get("nodeId");

    const reading = await db.sensorReading.findFirst({
      where: nodeId ? { nodeId } : undefined,
      orderBy: { recordedAt: "desc" },
    });

    if (!reading) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "No sensor readings found." } },
        { status: 404 }
      );
    }

    return NextResponse.json(reading);
  } catch {
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to fetch sensor reading." } },
      { status: 500 }
    );
  }
}
