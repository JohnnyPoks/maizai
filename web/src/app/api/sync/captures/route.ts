import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { uploadLeafImage } from "@/lib/cloudinary";
import { syncCaptureSchema } from "@/lib/schemas";

/**
 * Consolidated capture sync.
 *
 * The mobile app posts the captured image (as a base64 data URI or raw base64),
 * its on-device classification and the locally generated recommendation. The
 * server uploads the image to Cloudinary — keeping all upload credentials off
 * the device — and persists the image, classification and recommendation in a
 * single transaction so a capture is never half-synced.
 */
export async function POST(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json(
        { error: { code: "UNAUTHORIZED", message: "Authentication required." } },
        { status: 401 }
      );
    }

    const body = await req.json();
    const parsed = syncCaptureSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: parsed.error.issues[0].message } },
        { status: 400 }
      );
    }

    const data = parsed.data;
    const { url, publicId } = await uploadLeafImage(data.base64Image, user.id);

    const image = await db.leafImage.create({
      data: {
        userId: user.id,
        cloudinaryUrl: url,
        cloudinaryId: publicId,
        capturedAt: new Date(data.capturedAt),
        gpsLatitude: data.gpsLatitude,
        gpsLongitude: data.gpsLongitude,
        syncStatus: "SYNCED",
        classification: {
          create: {
            diseaseClass: data.diseaseClass,
            confidence: data.confidence,
            inferenceSource: "ON_DEVICE",
            classifiedAt: new Date(data.classifiedAt),
            recommendations: {
              create: {
                adviceType: data.recommendation.adviceType,
                adviceText: data.recommendation.adviceText,
                urgencyLevel: data.recommendation.urgencyLevel,
              },
            },
          },
        },
      },
      include: { classification: true },
    });

    return NextResponse.json(
      {
        imageId: image.id,
        classificationId: image.classification?.id,
        cloudinaryUrl: url,
      },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Capture sync failed." } },
      { status: 500 }
    );
  }
}
