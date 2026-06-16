import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  const email = req.nextUrl.searchParams.get("email")?.toLowerCase().trim();
  if (!email) {
    return NextResponse.json({ error: "email required" }, { status: 400 });
  }

  const user = await db.user.findFirst({ where: { email } });
  if (user) {
    return NextResponse.json({ step: "password" });
  }

  const request = await db.accessRequest.findFirst({
    where: { email },
    orderBy: { requestedAt: "desc" },
    select: { status: true, tempPassword: true, notes: true },
  });

  if (!request) {
    return NextResponse.json({ step: "not_found" });
  }

  if (request.status === "APPROVED" && request.tempPassword) {
    return NextResponse.json({ step: "approved", tempPassword: request.tempPassword });
  }

  if (request.status === "APPROVED") {
    // tempPassword already cleared but user row missing — treat as password step
    return NextResponse.json({ step: "password" });
  }

  if (request.status === "PENDING") {
    return NextResponse.json({ step: "pending" });
  }

  // DENIED
  return NextResponse.json({ step: "denied", reason: request.notes ?? null });
}
