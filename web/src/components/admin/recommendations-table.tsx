"use client";

import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/admin/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format, formatDistanceToNow } from "date-fns";
import { DiseaseClass, UrgencyLevel } from "@prisma/client";
import { CheckCircle2, Circle } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

type RecommendationRow = {
  id: string;
  adviceType: string;
  adviceText: string;
  urgencyLevel: UrgencyLevel;
  issuedAt: Date;
  resolvedAt: Date | null;
  classification: { diseaseClass: DiseaseClass };
  reading: { nodeId: string } | null;
};

const diseaseLabels: Record<DiseaseClass, string> = {
  HEALTHY: "Healthy",
  COMMON_RUST: "Common Rust",
  GRAY_LEAF_SPOT: "Gray Leaf Spot",
  BLIGHT: "Blight",
};

const urgencyBadge: Record<UrgencyLevel, string> = {
  HIGH: "bg-red-50 text-alert-high border-alert-high",
  MEDIUM: "bg-amber-50 text-alert-medium border-alert-medium",
  LOW: "bg-brand-50 text-brand-700 border-brand-300",
};

export function RecommendationsTable({ data }: { data: RecommendationRow[] }) {
  const router = useRouter();

  async function toggleResolve(id: string) {
    await fetch(`/api/recommendations/${id}/resolve`, { method: "POST" });
    router.refresh();
  }

  const columns: ColumnDef<RecommendationRow>[] = [
    {
      id: "disease",
      header: "Disease",
      accessorFn: (row) => diseaseLabels[row.classification.diseaseClass],
    },
    {
      accessorKey: "adviceType",
      header: "Advice Type",
      cell: ({ row }) => (
        <span className="font-mono text-xs text-earth-600">{row.original.adviceType}</span>
      ),
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
      accessorKey: "adviceText",
      header: "Advice",
      cell: ({ row }) => (
        <p className="text-xs text-earth-700 max-w-xs truncate" title={row.original.adviceText}>
          {row.original.adviceText}
        </p>
      ),
    },
    {
      accessorKey: "issuedAt",
      header: "Issued",
      cell: ({ row }) => (
        <span title={format(new Date(row.original.issuedAt), "dd MMM yyyy HH:mm:ss")}>
          {formatDistanceToNow(new Date(row.original.issuedAt), { addSuffix: true })}
        </span>
      ),
    },
    {
      id: "node",
      header: "Node",
      cell: ({ row }) =>
        row.original.reading ? (
          <span className="font-mono text-xs text-earth-500">{row.original.reading.nodeId}</span>
        ) : (
          <span className="text-earth-400">—</span>
        ),
    },
    {
      id: "resolve",
      header: "Resolved",
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "h-7 w-7",
            row.original.resolvedAt ? "text-brand-500" : "text-earth-300 hover:text-brand-400"
          )}
          title={row.original.resolvedAt ? "Mark unresolved" : "Mark resolved"}
          onClick={() => toggleResolve(row.original.id)}
        >
          {row.original.resolvedAt ? <CheckCircle2 size={15} /> : <Circle size={15} />}
        </Button>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={data}
      searchPlaceholder="Search recommendations…"
      exportFilename="recommendations"
    />
  );
}
