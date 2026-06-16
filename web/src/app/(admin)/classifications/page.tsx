export const dynamic = "force-dynamic";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Topbar } from "@/components/admin/topbar";
import { DataTable } from "@/components/admin/data-table";
import { Badge } from "@/components/ui/badge";
import { DiseaseClass } from "@prisma/client";
import { format } from "date-fns";

const diseaseLabels: Record<DiseaseClass, string> = {
  HEALTHY: "Healthy",
  COMMON_RUST: "Common Rust",
  GRAY_LEAF_SPOT: "Gray Leaf Spot",
  BLIGHT: "Blight",
};

const diseaseBadgeClass: Record<DiseaseClass, string> = {
  HEALTHY: "text-brand-700 border-brand-300",
  COMMON_RUST: "text-alert-medium border-alert-medium",
  GRAY_LEAF_SPOT: "text-alert-medium border-alert-medium",
  BLIGHT: "text-alert-high border-alert-high",
};

export default async function ClassificationsPage() {
  const session = await auth();
  const classifications = await db.classification.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { image: { include: { user: { select: { fullName: true } } } } },
  });

  const columns = [
    {
      key: "diseaseClass",
      header: "Disease",
      render: (row: (typeof classifications)[number]) => (
        <Badge variant="outline" className={`text-xs ${diseaseBadgeClass[row.diseaseClass]}`}>
          {diseaseLabels[row.diseaseClass]}
        </Badge>
      ),
    },
    {
      key: "confidence",
      header: "Confidence",
      render: (row: (typeof classifications)[number]) => (
        <span className="font-mono text-sm">{Math.round(row.confidence * 100)}%</span>
      ),
    },
    { key: "inferenceSource", header: "Source" },
    {
      key: "farmer",
      header: "Farmer",
      render: (row: (typeof classifications)[number]) => row.image.user.fullName,
    },
    {
      key: "classifiedAt",
      header: "Classified",
      render: (row: (typeof classifications)[number]) =>
        format(new Date(row.classifiedAt), "dd MMM yyyy HH:mm"),
    },
  ];

  return (
    <>
      <Topbar
        title="Classifications"
        userEmail={session?.user?.email ?? undefined}
        userName={session?.user?.name ?? undefined}
      />
      <main className="flex-1 overflow-y-auto p-6">
        <DataTable
          columns={columns}
          data={classifications}
          keyExtractor={(c) => c.id}
          emptyMessage="No classifications yet."
        />
      </main>
    </>
  );
}
