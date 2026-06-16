"use client";

import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/admin/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DiseaseClass, UrgencyLevel } from "@prisma/client";
import { Trash2, ToggleLeft, ToggleRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

type ThresholdRow = {
  id: string;
  diseaseClass: DiseaseClass;
  parameter: string;
  minValue: number | null;
  maxValue: number | null;
  urgencyLevel: UrgencyLevel;
  adviceType: string;
  adviceText: string;
  active: boolean;
  updatedAt: Date;
};

const diseaseLabels: Record<DiseaseClass, string> = {
  HEALTHY: "Healthy",
  COMMON_RUST: "Common Rust",
  GRAY_LEAF_SPOT: "Gray Leaf Spot",
  BLIGHT: "Blight",
};

const urgencyBadge: Record<UrgencyLevel, string> = {
  HIGH: "text-alert-high border-alert-high",
  MEDIUM: "text-alert-medium border-alert-medium",
  LOW: "text-brand-700 border-brand-300",
};

export function ThresholdsTable({ data, isSuperAdmin }: { data: ThresholdRow[]; isSuperAdmin: boolean }) {
  const router = useRouter();

  async function toggleActive(id: string, current: boolean) {
    await fetch(`/api/thresholds/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !current }),
    });
    router.refresh();
  }

  async function deleteThreshold(id: string) {
    if (!confirm("Delete this rule threshold? This will affect future recommendation generation.")) return;
    await fetch(`/api/thresholds/${id}`, { method: "DELETE" });
    router.refresh();
  }

  const columns: ColumnDef<ThresholdRow>[] = [
    {
      accessorKey: "diseaseClass",
      header: "Disease",
      cell: ({ row }) => (
        <span className="text-sm font-medium text-brand-800">
          {diseaseLabels[row.original.diseaseClass]}
        </span>
      ),
    },
    {
      accessorKey: "parameter",
      header: "Parameter",
      cell: ({ row }) => (
        <span className="font-mono text-xs text-earth-600">{row.original.parameter}</span>
      ),
    },
    {
      id: "range",
      header: "Range",
      cell: ({ row }) => {
        const { minValue, maxValue } = row.original;
        if (minValue == null && maxValue == null) return <span className="text-earth-400 text-xs">any</span>;
        if (minValue != null && maxValue == null) return <span className="font-mono text-xs">≥ {minValue}</span>;
        if (minValue == null && maxValue != null) return <span className="font-mono text-xs">≤ {maxValue}</span>;
        return <span className="font-mono text-xs">{minValue} – {maxValue}</span>;
      },
    },
    {
      accessorKey: "urgencyLevel",
      header: "Urgency",
      cell: ({ row }) => (
        <Badge variant="outline" className={cn("text-xs", urgencyBadge[row.original.urgencyLevel])}>
          {row.original.urgencyLevel}
        </Badge>
      ),
    },
    {
      accessorKey: "adviceType",
      header: "Advice Type",
      cell: ({ row }) => (
        <span className="font-mono text-xs text-earth-600">{row.original.adviceType}</span>
      ),
    },
    {
      accessorKey: "adviceText",
      header: "Advice",
      cell: ({ row }) => (
        <p className="text-xs text-earth-700 max-w-xs truncate" title={row.original.adviceText}>
          {row.original.adviceText}
        </p>
      ),
    },
    {
      accessorKey: "active",
      header: "Active",
      cell: ({ row }) =>
        isSuperAdmin ? (
          <Button
            variant="ghost"
            size="icon"
            className={cn("h-7 w-7", row.original.active ? "text-brand-500" : "text-earth-300")}
            onClick={() => toggleActive(row.original.id, row.original.active)}
            title={row.original.active ? "Deactivate" : "Activate"}
          >
            {row.original.active ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
          </Button>
        ) : (
          <Badge variant="outline" className={row.original.active ? "text-brand-700 border-brand-300" : "text-earth-400 border-earth-300"}>
            {row.original.active ? "Active" : "Inactive"}
          </Badge>
        ),
    },
    ...(isSuperAdmin
      ? [
          {
            id: "actions",
            header: "",
            cell: ({ row }: { row: { original: ThresholdRow } }) => (
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-earth-400 hover:text-alert-high"
                onClick={() => deleteThreshold(row.original.id)}
                title="Delete threshold"
              >
                <Trash2 size={13} />
              </Button>
            ),
          } as ColumnDef<ThresholdRow>,
        ]
      : []),
  ];

  return (
    <DataTable
      columns={columns}
      data={data}
      searchPlaceholder="Search thresholds…"
      exportFilename="thresholds"
    />
  );
}
