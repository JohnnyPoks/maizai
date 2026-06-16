import { NextResponse } from "next/server";
import type { HealthResponse } from "@/types/api";

export async function GET() {
  const body: HealthResponse = {
    status: "ok",
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version ?? "0.1.0",
  };
  return NextResponse.json(body);
}
