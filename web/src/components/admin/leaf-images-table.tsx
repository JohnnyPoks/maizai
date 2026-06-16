"use client";

import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/admin/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format, formatDistanceToNow } from "date-fns";
import { DiseaseClass, SyncStatus } from "@prisma/client";
import { Trash2, ExternalLink } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Image from "next/image";

type LeafImageRow = {
  id: string;
  cloudinaryUrl: string;
  cloudinaryId: string;
  capturedAt: Date;
  gpsLatitude: number | null;
  gpsLongitude: number | null;
  syncStatus: SyncStatus;
  uploadedAt: Date;
  user: { fullName: string };
  classification: { diseaseClass: DiseaseClass; confidence: number } | null;
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

const syncBadge: Record<SyncStatus, string> = {
  SYNCED: "text-brand-700 border-brand-300",
  PENDING: "text-alert-medium border-alert-medium",
  FAILED: "text-alert-high border-alert-high",
};

export function LeafImagesTable({ data }: { data: LeafImageRow[] }) {
  const router = useRouter();
  const { data: session } = useSession();
  const isSuperAdmin = (session?.user as unknown as { role?: string })?.role === "SUPER_ADMIN";

  async function deleteImage(id: string) {
    if (!confirm("Delete this leaf image and its Cloudinary record? This cannot be undone.")) return;
    await fetch(`/api/leaf-images/${id}`, { method: "DELETE" });
    router.refresh();
  }

  const columns: ColumnDef<LeafImageRow>[] = [
    {
      id: "thumbnail",
      header: "Image",
      cell: ({ row }) => (
        <a href={row.original.cloudinaryUrl} target="_blank" rel="noopener noreferrer">
          <Image
            src={row.original.cloudinaryUrl}
            alt="Leaf thumbnail"
            width={40}
            height={40}
            className="rounded object-cover w-10 h-10 border border-brand-100"
          />
        </a>
      ),
    },
    {
      accessorKey: "capturedAt",
      header: "Captured",
      cell: ({ row }) => (
        <span title={format(new Date(row.original.capturedAt), "dd MMM yyyy HH:mm:ss")}>
          {formatDistanceToNow(new Date(row.original.capturedAt), { addSuffix: true })}
        </span>
      ),
    },
    {
      id: "farmer",
      header: "Farmer",
      accessorFn: (row) => row.user.fullName,
    },
    {
      id: "gps",
      header: "GPS",
      cell: ({ row }) =>
        row.original.gpsLatitude != null && row.original.gpsLongitude != null
          ? `${row.original.gpsLatitude.toFixed(4)}, ${row.original.gpsLongitude.toFixed(4)}`
          : <span className="text-earth-400">—</span>,
    },
    {
      id: "classification",
      header: "Classification",
      cell: ({ row }) =>
        row.original.classification ? (
          <div className="flex items-center gap-1.5">
            <Badge variant="outline" className={`text-xs ${diseaseBadge[row.original.classification.diseaseClass]}`}>
              {diseaseLabels[row.original.classification.diseaseClass]}
            </Badge>
            <span className="text-xs font-mono text-earth-500">
              {Math.round(row.original.classification.confidence * 100)}%
            </span>
          </div>
        ) : (
          <span className="text-xs text-earth-400">Unclassified</span>
        ),
    },
    {
      accessorKey: "syncStatus",
      header: "Sync",
      cell: ({ row }) => (
        <Badge variant="outline" className={`text-xs ${syncBadge[row.original.syncStatus]}`}>
          {row.original.syncStatus}
        </Badge>
      ),
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-7 w-7 text-earth-400 hover:text-brand-600" asChild>
            <a href={row.original.cloudinaryUrl} target="_blank" rel="noopener noreferrer" title="Open original">
              <ExternalLink size={13} />
            </a>
          </Button>
          {isSuperAdmin && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-earth-400 hover:text-alert-high"
              title="Delete image"
              onClick={() => deleteImage(row.original.id)}
            >
              <Trash2 size={13} />
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={data}
      searchPlaceholder="Search images…"
      exportFilename="leaf-images"
    />
  );
}
