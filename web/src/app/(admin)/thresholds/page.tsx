export const dynamic = "force-dynamic";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Topbar } from "@/components/admin/topbar";
import { ThresholdEditor } from "@/components/admin/threshold-editor";
import { DiseaseClass } from "@prisma/client";
import { Separator } from "@/components/ui/separator";

const diseaseLabels: Record<DiseaseClass, string> = {
  HEALTHY: "Healthy",
  COMMON_RUST: "Common Rust",
  GRAY_LEAF_SPOT: "Gray Leaf Spot",
  BLIGHT: "Blight",
};

export default async function ThresholdsPage() {
  const session = await auth();
  const thresholds = await db.ruleThreshold.findMany({ orderBy: [{ diseaseClass: "asc" }, { createdAt: "asc" }] });

  const grouped = thresholds.reduce<Record<string, typeof thresholds>>((acc, t) => {
    const key = t.diseaseClass;
    if (!acc[key]) acc[key] = [];
    acc[key].push(t);
    return acc;
  }, {});

  return (
    <>
      <Topbar
        title="Rule Thresholds"
        userEmail={session?.user?.email ?? undefined}
        userName={session?.user?.name ?? undefined}
      />
      <main className="flex-1 overflow-y-auto p-6 space-y-8">
        {Object.entries(grouped).map(([disease, items]) => (
          <div key={disease}>
            <h2 className="mb-3 text-sm font-semibold text-brand-800">
              {diseaseLabels[disease as DiseaseClass]}
            </h2>
            <div className="space-y-3">
              {items.map((t) => (
                <ThresholdEditor key={t.id} threshold={t} />
              ))}
            </div>
            <Separator className="mt-6" />
          </div>
        ))}
        {thresholds.length === 0 && (
          <p className="text-sm text-earth-400">
            No thresholds configured. Run <code className="font-mono text-xs">pnpm db:seed</code> to create the defaults.
          </p>
        )}
      </main>
    </>
  );
}
