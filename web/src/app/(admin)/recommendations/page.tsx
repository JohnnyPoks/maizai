export const dynamic = "force-dynamic";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Topbar } from "@/components/admin/topbar";
import { RecommendationCard } from "@/components/admin/recommendation-card";
import { DiseaseClass } from "@prisma/client";

const diseaseLabels: Record<DiseaseClass, string> = {
  HEALTHY: "Healthy",
  COMMON_RUST: "Common Rust",
  GRAY_LEAF_SPOT: "Gray Leaf Spot",
  BLIGHT: "Blight",
};

export default async function RecommendationsPage() {
  const session = await auth();
  const recommendations = await db.recommendation.findMany({
    orderBy: { issuedAt: "desc" },
    take: 50,
    include: { classification: true },
  });

  return (
    <>
      <Topbar
        title="Recommendations"
        userEmail={session?.user?.email ?? undefined}
        userName={session?.user?.name ?? undefined}
      />
      <main className="flex-1 overflow-y-auto p-6 space-y-3">
        {recommendations.length === 0 ? (
          <p className="text-sm text-earth-400">No recommendations issued yet.</p>
        ) : (
          recommendations.map((r) => (
            <RecommendationCard
              key={r.id}
              adviceType={r.adviceType}
              adviceText={r.adviceText}
              urgencyLevel={r.urgencyLevel}
              issuedAt={r.issuedAt}
              diseaseClass={diseaseLabels[r.classification.diseaseClass]}
            />
          ))
        )}
      </main>
    </>
  );
}
