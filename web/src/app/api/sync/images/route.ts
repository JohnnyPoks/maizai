import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { uploadLeafImage } from "@/lib/cloudinary";
import { syncImageSchema } from "@/lib/schemas";

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
    const parsed = syncImageSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: parsed.error.issues[0].message } },
        { status: 400 }
      );
    }

    const { url, publicId } = await uploadLeafImage(parsed.data.base64Image, user.id);

    const image = await db.leafImage.create({
      data: {
        userId: user.id,
        cloudinaryUrl: url,
        cloudinaryId: publicId,
        capturedAt: new Date(parsed.data.capturedAt),
        gpsLatitude: parsed.data.gpsLatitude,
        gpsLongitude: parsed.data.gpsLongitude,
        syncStatus: "SYNCED",
      },
    });

    return NextResponse.json({ imageId: image.id, cloudinaryUrl: url }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Image upload failed." } },
      { status: 500 }
    );
  }
}
