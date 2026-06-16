export const dynamic = "force-dynamic";

import { db } from "@/lib/db";
import { AdminTopbar } from "@/components/admin/admin-topbar";
import { RecommendationsTable } from "@/components/admin/recommendations-table";
import { EmptyState } from "@/components/admin/empty-state";
import { Lightbulb } from "lucide-react";

export default async function RecommendationsPage() {
  const recommendations = await db.recommendation.findMany({
    orderBy: { issuedAt: "desc" },
    take: 200,
    include: {
      classification: { select: { diseaseClass: true } },
      reading: { select: { nodeId: true } },
    },
  });

  return (
    <>
      <AdminTopbar title="Recommendations" />
      <main className="flex-1 overflow-y-auto p-4 md:p-6">
        {recommendations.length === 0 ? (
          <EmptyState
            icon={Lightbulb}
            title="No recommendations yet"
            description="Recommendations are generated automatically after each disease classification and linked sensor reading."
          />
        ) : (
          <RecommendationsTable data={recommendations} />
        )}
      </main>
    </>
  );
}
