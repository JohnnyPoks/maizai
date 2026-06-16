"use client";

import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/admin/data-table";
import { Badge } from "@/components/ui/badge";
import { format, formatDistanceToNow } from "date-fns";
import { DiseaseClass, InferenceSource } from "@prisma/client";
import Image from "next/image";

type ClassificationRow = {
  id: string;
  diseaseClass: DiseaseClass;
  confidence: number;
  inferenceSource: InferenceSource;
  classifiedAt: Date;
  createdAt: Date;
  image: { cloudinaryUrl: string; user: { fullName: string } };
  recommendations: { id: string }[];
};

const diseaseLabels: Record<DiseaseClass, string> = {
  HEALTHY: "Healthy",
  COMMON_RUST: "Common Rust",
  GRAY_LEAF_SPOT: "Gray Leaf Spot",
  BLIGHT: "Blight",
};

const diseaseBadge: Record<DiseaseClass, string> = {
  HEALTHY: "text-brand-700 border-brand-300",
  COMMON_RUST: "text-alert-medium border-alert-medium",
  GRAY_LEAF_SPOT: "text-alert-medium border-alert-medium",
  BLIGHT: "text-alert-high border-alert-high",
};

export function ClassificationsTable({ data }: { data: ClassificationRow[] }) {
  const columns: ColumnDef<ClassificationRow>[] = [
    {
      id: "thumbnail",
      header: "Image",
      cell: ({ row }) => (
        <a href={row.original.image.cloudinaryUrl} target="_blank" rel="noopener noreferrer">
          <Image
            src={row.original.image.cloudinaryUrl}
            alt="Leaf thumbnail"
            width={36}
            height={36}
            className="rounded object-cover w-9 h-9 border border-brand-100"
          />
        </a>
      ),
    },
    {
      accessorKey: "diseaseClass",
      header: "Prediction",
      cell: ({ row }) => (
        <Badge variant="outline" className={`text-xs ${diseaseBadge[row.original.diseaseClass]}`}>
          {diseaseLabels[row.original.diseaseClass]}
        </Badge>
      ),
    },
    {
      accessorKey: "confidence",
      header: "Confidence",
      cell: ({ row }) => {
        const pct = Math.round(row.original.confidence * 100);
        return (
          <div className="flex items-center gap-2 min-w-[80px]">
            <div className="flex-1 h-1.5 bg-brand-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-brand-500 rounded-full"
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="text-xs font-mono text-earth-600 w-8 text-right">{pct}%</span>
          </div>
        );
      },
    },
    {
      accessorKey: "inferenceSource",
      header: "Source",
      cell: ({ row }) => (
        <span className="text-xs text-earth-500">
          {row.original.inferenceSource === InferenceSource.ON_DEVICE ? "On-Device" : "Cloud"}
        </span>
      ),
    },
    {
      id: "farmer",
      header: "Farmer",
      accessorFn: (row) => row.image.user.fullName,
    },
    {
      accessorKey: "classifiedAt",
      header: "Classified",
      cell: ({ row }) => (
        <span title={format(new Date(row.original.classifiedAt), "dd MMM yyyy HH:mm:ss")}>
          {formatDistanceToNow(new Date(row.original.classifiedAt), { addSuffix: true })}
        </span>
      ),
    },
    {
      id: "recs",
      header: "Recommendations",
      cell: ({ row }) => (
        <span className="text-xs font-mono text-earth-500">
          {row.original.recommendations.length}
        </span>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={data}
      searchPlaceholder="Search classifications…"
      exportFilename="classifications"
    />
  );
}
