import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sensorIngestSchema } from "@/lib/schemas";

export async function POST(req: NextRequest) {
  try {
    const token = req.headers.get("x-sensor-token");
    if (!token || token !== process.env.SENSOR_INGEST_TOKEN) {
      return NextResponse.json(
        { error: { code: "UNAUTHORIZED", message: "Invalid sensor token." } },
        { status: 401 }
      );
    }

    const body = await req.json();
    const parsed = sensorIngestSchema.safeParse(body);
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
        recordedAt: parsed.data.recordedAt ? new Date(parsed.data.recordedAt) : new Date(),
      },
    });

    return NextResponse.json({ readingId: reading.id }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Ingest failed." } },
      { status: 500 }
    );
  }
}
