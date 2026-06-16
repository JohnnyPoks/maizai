export const dynamic = "force-dynamic";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Topbar } from "@/components/admin/topbar";
import { DataTable } from "@/components/admin/data-table";
import { format } from "date-fns";

export default async function SensorReadingsPage() {
  const session = await auth();
  const readings = await db.sensorReading.findMany({
    orderBy: { recordedAt: "desc" },
    take: 200,
  });

  const columns = [
    { key: "nodeId", header: "Node ID" },
    {
      key: "soilMoisture",
      header: "Soil Moisture (%)",
      render: (row: (typeof readings)[number]) => (
        <span className="font-mono">{row.soilMoisture.toFixed(1)}</span>
      ),
    },
    {
      key: "ambientTemperature",
      header: "Temp (°C)",
      render: (row: (typeof readings)[number]) => (
        <span className="font-mono">{row.ambientTemperature.toFixed(1)}</span>
      ),
    },
    {
      key: "relativeHumidity",
      header: "Humidity (%)",
      render: (row: (typeof readings)[number]) => (
        <span className="font-mono">{row.relativeHumidity.toFixed(1)}</span>
      ),
    },
    {
      key: "recordedAt",
      header: "Recorded",
      render: (row: (typeof readings)[number]) =>
        format(new Date(row.recordedAt), "dd MMM yyyy HH:mm:ss"),
    },
  ];

  return (
    <>
      <Topbar
        title="Sensor Readings"
        userEmail={session?.user?.email ?? undefined}
        userName={session?.user?.name ?? undefined}
      />
      <main className="flex-1 overflow-y-auto p-6">
        <DataTable
          columns={columns}
          data={readings}
          keyExtractor={(r) => r.id}
          emptyMessage="No sensor readings received yet."
        />
      </main>
    </>
  );
}
