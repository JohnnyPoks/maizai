export const dynamic = "force-dynamic";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Topbar } from "@/components/admin/topbar";
import { DataTable } from "@/components/admin/data-table";
import { Badge } from "@/components/ui/badge";
import { SyncStatus } from "@prisma/client";
import { format } from "date-fns";

export default async function LeafImagesPage() {
  const session = await auth();
  const images = await db.leafImage.findMany({
    orderBy: { uploadedAt: "desc" },
    take: 100,
    include: { user: { select: { fullName: true } } },
  });

  const statusColors: Record<SyncStatus, string> = {
    SYNCED: "text-brand-700 border-brand-300",
    PENDING: "text-alert-medium border-alert-medium",
    FAILED: "text-alert-high border-alert-high",
  };

  const columns = [
    {
      key: "cloudinaryUrl",
      header: "Image",
      render: (row: (typeof images)[number]) => (
        <a href={row.cloudinaryUrl} target="_blank" rel="noopener noreferrer" className="text-brand-600 hover:underline text-xs truncate block max-w-[160px]">
          View
        </a>
      ),
    },
    { key: "user", header: "Farmer", render: (row: (typeof images)[number]) => row.user.fullName },
    {
      key: "capturedAt",
      header: "Captured",
      render: (row: (typeof images)[number]) => format(new Date(row.capturedAt), "dd MMM yyyy HH:mm"),
    },
    {
      key: "syncStatus",
      header: "Sync",
      render: (row: (typeof images)[number]) => (
        <Badge variant="outline" className={`text-xs ${statusColors[row.syncStatus]}`}>
          {row.syncStatus}
        </Badge>
      ),
    },
  ];

  return (
    <>
      <Topbar
        title="Leaf Images"
        userEmail={session?.user?.email ?? undefined}
        userName={session?.user?.name ?? undefined}
      />
      <main className="flex-1 overflow-y-auto p-6">
        <DataTable
          columns={columns}
          data={images}
          keyExtractor={(i) => i.id}
          emptyMessage="No leaf images uploaded yet."
        />
      </main>
    </>
  );
}
