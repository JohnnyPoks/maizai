import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function GET(req: NextRequest, { params }: { params: Promise<{ resource: string }> }) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json(
      { error: { code: "UNAUTHORIZED", message: "Authentication required." } },
      { status: 401 }
    );
  }

  const { resource } = await params;
  let rows: Record<string, unknown>[] = [];

  switch (resource) {
    case "classifications":
      rows = (await db.classification.findMany({
        include: { image: { select: { cloudinaryUrl: true, capturedAt: true } } },
        orderBy: { createdAt: "desc" },
      })).map((c) => ({
        id: c.id,
        diseaseClass: c.diseaseClass,
        confidence: c.confidence,
        inferenceSource: c.inferenceSource,
        classifiedAt: c.classifiedAt.toISOString(),
        createdAt: c.createdAt.toISOString(),
        imageUrl: c.image.cloudinaryUrl,
      }));
      break;
    case "sensor-readings":
      rows = (await db.sensorReading.findMany({ orderBy: { recordedAt: "desc" } })).map((r) => ({
        id: r.id,
        nodeId: r.nodeId,
        soilMoisture: r.soilMoisture,
        ambientTemperature: r.ambientTemperature,
        relativeHumidity: r.relativeHumidity,
        recordedAt: r.recordedAt.toISOString(),
        receivedAt: r.receivedAt.toISOString(),
      }));
      break;
    case "recommendations":
      rows = (await db.recommendation.findMany({
        include: { classification: { select: { diseaseClass: true } } },
        orderBy: { issuedAt: "desc" },
      })).map((r) => ({
        id: r.id,
        diseaseClass: r.classification.diseaseClass,
        adviceType: r.adviceType,
        adviceText: r.adviceText,
        urgencyLevel: r.urgencyLevel,
        issuedAt: r.issuedAt.toISOString(),
        resolvedAt: r.resolvedAt?.toISOString() ?? "",
      }));
      break;
    case "users":
      rows = (await db.user.findMany({
        select: { id: true, email: true, fullName: true, role: true, disabled: true, createdAt: true, lastSignInAt: true },
        orderBy: { createdAt: "desc" },
      })).map((u) => ({
        ...u,
        createdAt: u.createdAt.toISOString(),
        lastSignInAt: u.lastSignInAt?.toISOString() ?? "",
      }));
      break;
    default:
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: `Unknown resource: ${resource}` } },
        { status: 404 }
      );
  }

  if (rows.length === 0) return NextResponse.json({ data: [] });

  const headers = Object.keys(rows[0]);
  const csv = [
    headers.join(","),
    ...rows.map((row) =>
      headers
        .map((h) => {
          const val = String(row[h] ?? "");
          return val.includes(",") || val.includes('"') || val.includes("\n")
            ? `"${val.replace(/"/g, '""')}"`
            : val;
        })
        .join(",")
    ),
  ].join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="${resource}-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
