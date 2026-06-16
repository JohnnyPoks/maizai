import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { syncClassificationSchema } from "@/lib/schemas";

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
    const parsed = syncClassificationSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: parsed.error.issues[0].message } },
        { status: 400 }
      );
    }

    const image = await db.leafImage.findFirst({
      where: { id: parsed.data.imageId, userId: session.user.id },
    });
    if (!image) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Image not found or does not belong to this user." } },
        { status: 404 }
      );
    }

    const classification = await db.classification.upsert({
      where: { imageId: parsed.data.imageId },
      update: {
        diseaseClass: parsed.data.diseaseClass,
        confidence: parsed.data.confidence,
        inferenceSource: parsed.data.inferenceSource,
        classifiedAt: new Date(parsed.data.classifiedAt),
      },
      create: {
        imageId: parsed.data.imageId,
        diseaseClass: parsed.data.diseaseClass,
        confidence: parsed.data.confidence,
        inferenceSource: parsed.data.inferenceSource ?? "ON_DEVICE",
        classifiedAt: new Date(parsed.data.classifiedAt),
      },
    });

    return NextResponse.json({ classificationId: classification.id }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Classification sync failed." } },
      { status: 500 }
    );
  }
}
