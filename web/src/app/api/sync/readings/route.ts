import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { syncReadingSchema } from "@/lib/schemas";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: { code: "UNAUTHORIZED", message: "Authentication required." } },
        { status: 401 }
      );
    }

    const body = await req.json();
    const parsed = syncReadingSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: parsed.error.issues[0].message } },
        { status: 400 }
      );
    }

    const reading = await db.sensorReading.create({
      data: {
        nodeId: parsed.data.nodeId,
        soilMoisture: parsed.data.soilMoisture,
        ambientTemperature: parsed.data.ambientTemperature,
        relativeHumidity: parsed.data.relativeHumidity,
        recordedAt: new Date(parsed.data.recordedAt),
      },
    });

    return NextResponse.json({ readingId: reading.id }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Reading sync failed." } },
      { status: 500 }
    );
  }
}
