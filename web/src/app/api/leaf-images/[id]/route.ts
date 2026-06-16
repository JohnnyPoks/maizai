import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { Role } from "@prisma/client";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

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
  const image = await db.leafImage.findUnique({ where: { id } });
  if (!image) {
    return NextResponse.json(
      { error: { code: "NOT_FOUND", message: "Leaf image not found." } },
      { status: 404 }
    );
  }

  await cloudinary.uploader.destroy(image.cloudinaryId).catch(console.error);
  await db.leafImage.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
