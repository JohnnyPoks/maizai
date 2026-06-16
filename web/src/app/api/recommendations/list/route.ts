import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: { code: "UNAUTHORIZED", message: "Authentication required." } },
        { status: 401 }
      );
    }

    const limit = parseInt(req.nextUrl.searchParams.get("limit") ?? "20", 10);

    const recommendations = await db.recommendation.findMany({
      where: {
        classification: {
          image: { userId: session.user.id },
        },
      },
      orderBy: { issuedAt: "desc" },
      take: Math.min(limit, 100),
      include: {
        classification: { select: { diseaseClass: true, confidence: true } },
        reading: { select: { soilMoisture: true, ambientTemperature: true, relativeHumidity: true } },
      },
    });

    return NextResponse.json(recommendations);
  } catch {
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to fetch recommendations." } },
      { status: 500 }
    );
  }
}
