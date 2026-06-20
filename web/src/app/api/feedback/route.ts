import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthenticatedUser } from "@/lib/auth";
import { feedbackSchema } from "@/lib/schemas";
import { notifySuperAdminOfFeedback } from "@/lib/email";
import { Role } from "@prisma/client";

// Submit feedback from the mobile app. Auth is optional: if a Bearer token is
// present we record the reporter's email, otherwise the body may supply one.
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = feedbackSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: { code: "VALIDATION_ERROR", message: parsed.error.errors[0].message } },
      { status: 400 }
    );
  }

  const user = await getAuthenticatedUser(req).catch(() => null);
  const email = user?.email ?? parsed.data.email ?? null;

  const feedback = await db.feedback.create({
    data: {
      type: parsed.data.type,
      message: parsed.data.message,
      appVersion: parsed.data.appVersion ?? null,
      device: parsed.data.device ?? null,
      email,
    },
  });

  await notifySuperAdminOfFeedback({
    type: feedback.type,
    message: feedback.message,
    email: feedback.email,
    appVersion: feedback.appVersion,
    id: feedback.id,
  }).catch(console.error);

  return NextResponse.json({ id: feedback.id }, { status: 201 });
}

// List feedback for the dashboard (admins only).
export async function GET(req: NextRequest) {
  const user = await getAuthenticatedUser(req);
  if (!user || (user.role !== Role.ADMIN && user.role !== Role.SUPER_ADMIN)) {
    return NextResponse.json(
      { error: { code: "FORBIDDEN", message: "Admin access required." } },
      { status: user ? 403 : 401 }
    );
  }

  const feedback = await db.feedback.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
  });
  return NextResponse.json({ feedback });
}
