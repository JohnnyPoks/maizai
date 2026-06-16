export const dynamic = "force-dynamic";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { AdminTopbar } from "@/components/admin/admin-topbar";
import { SensorReadingsTable } from "@/components/admin/sensor-readings-table";
import { EmptyState } from "@/components/admin/empty-state";
import { SensorChart } from "@/components/admin/sensor-chart";
import { Cpu } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { subHours } from "date-fns";

export default async function SensorReadingsPage() {
  const session = await auth();
  const isSuperAdmin = (session?.user as unknown as { role?: string })?.role === "SUPER_ADMIN";
  const [readings, chartReadings] = await Promise.all([
    db.sensorReading.findMany({ orderBy: { recordedAt: "desc" }, take: 200 }),
    db.sensorReading.findMany({
      where: { receivedAt: { gte: subHours(new Date(), 24) } },
      orderBy: { recordedAt: "asc" },
      take: 100,
    }),
  ]);

  return (
    <>
      <AdminTopbar title="Sensor Readings" />
      <main className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
        {chartReadings.length > 0 && (
          <Card className="border-brand-100 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-brand-800">Last 24 Hours</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <SensorChart data={chartReadings} />
            </CardContent>
          </Card>
        )}
        {readings.length === 0 ? (
          <EmptyState
            icon={Cpu}
            title="No sensor readings yet"
            description="Readings will appear here once the ESP32 sensor node begins transmitting data."
          />
        ) : (
          <SensorReadingsTable data={readings} isSuperAdmin={isSuperAdmin} />
        )}
      </main>
    </>
  );
}
