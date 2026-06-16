import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { generateRecommendation } from "@/lib/rule-engine";
import { generateRecommendationSchema } from "@/lib/schemas";

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
    const parsed = generateRecommendationSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: parsed.error.issues[0].message } },
        { status: 400 }
      );
    }

    const classification = await db.classification.findUnique({
      where: { id: parsed.data.classificationId },
    });
    if (!classification) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Classification not found." } },
        { status: 404 }
      );
    }

    let reading = null;
    if (parsed.data.readingId) {
      reading = await db.sensorReading.findUnique({ where: { id: parsed.data.readingId } });
    }

    const output = await generateRecommendation({
      classification: {
        diseaseClass: classification.diseaseClass,
        confidence: classification.confidence,
      },
      reading: reading
        ? {
            soilMoisture: reading.soilMoisture,
            ambientTemperature: reading.ambientTemperature,
            relativeHumidity: reading.relativeHumidity,
          }
        : undefined,
    });

    const recommendation = await db.recommendation.create({
      data: {
        classificationId: classification.id,
        readingId: reading?.id ?? null,
        adviceType: output.adviceType,
        adviceText: output.adviceText,
        urgencyLevel: output.urgencyLevel,
      },
    });

    return NextResponse.json(recommendation, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Recommendation generation failed." } },
      { status: 500 }
    );
  }
}
