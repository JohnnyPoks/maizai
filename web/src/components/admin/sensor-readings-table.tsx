"use client";

import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/admin/data-table";
import { Button } from "@/components/ui/button";
import { format, formatDistanceToNow, differenceInMinutes } from "date-fns";
import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

type SensorReadingRow = {
  id: string;
  nodeId: string;
  soilMoisture: number;
  ambientTemperature: number;
  relativeHumidity: number;
  recordedAt: Date;
  receivedAt: Date;
};

export function SensorReadingsTable({ data, isSuperAdmin }: { data: SensorReadingRow[]; isSuperAdmin: boolean }) {
  const router = useRouter();

  async function deleteReading(id: string) {
    if (!confirm("Delete this sensor reading?")) return;
    await fetch(`/api/sensor-readings/${id}`, { method: "DELETE" });
    router.refresh();
  }

  const columns: ColumnDef<SensorReadingRow>[] = [
    {
      accessorKey: "nodeId",
      header: "Node ID",
      cell: ({ row }) => (
        <span className="font-mono text-xs bg-brand-50 text-brand-800 px-1.5 py-0.5 rounded">
          {row.original.nodeId}
        </span>
      ),
    },
    {
      accessorKey: "soilMoisture",
      header: "Soil Moisture (%)",
      cell: ({ row }) => <span className="font-mono">{row.original.soilMoisture.toFixed(1)}</span>,
    },
    {
      accessorKey: "ambientTemperature",
      header: "Temp (°C)",
      cell: ({ row }) => <span className="font-mono">{row.original.ambientTemperature.toFixed(1)}</span>,
    },
    {
      accessorKey: "relativeHumidity",
      header: "Humidity (%)",
      cell: ({ row }) => <span className="font-mono">{row.original.relativeHumidity.toFixed(1)}</span>,
    },
    {
      accessorKey: "recordedAt",
      header: "Recorded",
      cell: ({ row }) => (
        <span title={format(new Date(row.original.recordedAt), "dd MMM yyyy HH:mm:ss")}>
          {formatDistanceToNow(new Date(row.original.recordedAt), { addSuffix: true })}
        </span>
      ),
    },
    {
      accessorKey: "receivedAt",
      header: "Received (delta)",
      cell: ({ row }) => {
        const delta = differenceInMinutes(
          new Date(row.original.receivedAt),
          new Date(row.original.recordedAt)
        );
        return (
          <span
            className={cn(
              "font-mono text-xs",
              delta > 5 ? "text-alert-medium" : "text-earth-500"
            )}
            title={format(new Date(row.original.receivedAt), "dd MMM yyyy HH:mm:ss")}
          >
            +{delta}m
          </span>
        );
      },
    },
    ...(isSuperAdmin
      ? [
          {
            id: "actions",
            header: "",
            cell: ({ row }: { row: { original: SensorReadingRow } }) => (
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-earth-400 hover:text-alert-high"
                onClick={() => deleteReading(row.original.id)}
                title="Delete reading"
              >
                <Trash2 size={13} />
              </Button>
            ),
          } as ColumnDef<SensorReadingRow>,
        ]
      : []),
  ];

  return (
    <DataTable
      columns={columns}
      data={data}
      searchPlaceholder="Search by node ID…"
      exportFilename="sensor-readings"
    />
  );
}
