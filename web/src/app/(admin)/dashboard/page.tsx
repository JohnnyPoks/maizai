export const dynamic = "force-dynamic";

import { db } from "@/lib/db";
import { AdminTopbar } from "@/components/admin/admin-topbar";
import { StatCard } from "@/components/admin/stat-card";
import { RecommendationCard } from "@/components/admin/recommendation-card";
import { SensorChart } from "@/components/admin/sensor-chart";
import { Image, Microscope, Cpu, Lightbulb } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { DiseaseClass } from "@prisma/client";
import { subDays, subHours } from "date-fns";

const diseaseLabels: Record<DiseaseClass, string> = {
  HEALTHY: "Healthy",
  COMMON_RUST: "Common Rust",
  GRAY_LEAF_SPOT: "Gray Leaf Spot",
  BLIGHT: "Blight",
};

export default async function DashboardPage() {
  const now = new Date();
  const yesterday = subDays(now, 1);
  const twentyFourHoursAgo = subHours(now, 24);
  const fortyEightHoursAgo = subHours(now, 48);

  const [
    totalImages,
    imagesYesterday,
    totalClassifications,
    activeNodes,
    recommendationsToday,
    recentClassifications,
    sensorReadings,
    activeRecommendations,
  ] = await Promise.all([
    db.leafImage.count(),
    db.leafImage.count({ where: { uploadedAt: { gte: yesterday } } }),
    db.classification.count(),
    db.sensorReading.groupBy({ by: ["nodeId"], where: { receivedAt: { gte: twentyFourHoursAgo } } }),
    db.recommendation.count({ where: { issuedAt: { gte: yesterday } } }),
    db.classification.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      include: { image: { include: { user: { select: { fullName: true, email: true } } } } },
    }),
    db.sensorReading.findMany({
      where: { receivedAt: { gte: twentyFourHoursAgo } },
      orderBy: { recordedAt: "asc" },
      take: 100,
    }),
    db.recommendation.findMany({
      where: { issuedAt: { gte: fortyEightHoursAgo }, urgencyLevel: "HIGH" },
      include: { classification: true },
      orderBy: { issuedAt: "desc" },
      take: 5,
    }),
  ]);

  return (
    <>
      <AdminTopbar title="Dashboard" />
      <main className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
        {/* Stat cards */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Leaf Images"
            value={totalImages.toLocaleString()}
            delta={`+${imagesYesterday} in the last 24 h`}
            deltaPositive={imagesYesterday > 0}
            icon={Image}
          />
          <StatCard
            title="Classifications"
            value={totalClassifications.toLocaleString()}
            icon={Microscope}
          />
          <StatCard
            title="Active Sensor Nodes"
            value={activeNodes.length}
            delta="Last 24 hours"
            deltaPositive
            icon={Cpu}
          />
          <StatCard
            title="Recommendations Today"
            value={recommendationsToday}
            icon={Lightbulb}
          />
        </div>

        {/* Middle row */}
        <div className="grid gap-6 xl:grid-cols-2">
          {/* Recent classifications */}
          <Card className="border-brand-100 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-brand-800">
                Recent Classifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 pt-0">
              {recentClassifications.length === 0 ? (
                <p className="text-sm text-earth-400">No classifications yet.</p>
              ) : (
                recentClassifications.map((c) => (
                  <div key={c.id} className="flex items-center gap-3 rounded-md border border-brand-50 p-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-brand-800 truncate">
                        {diseaseLabels[c.diseaseClass]}
                      </p>
                      <p className="text-xs text-earth-400 truncate">
                        {c.image.user.fullName} ·{" "}
                        {formatDistanceToNow(new Date(c.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                    <Badge
                      variant="outline"
                      className="text-xs shrink-0 font-mono"
                    >
                      {Math.round(c.confidence * 100)}%
                    </Badge>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Sensor chart */}
          <Card className="border-brand-100 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-brand-800">
                Sensor Readings (last 24 h)
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              {sensorReadings.length === 0 ? (
                <p className="text-sm text-earth-400">No sensor data in the last 24 hours.</p>
              ) : (
                <SensorChart data={sensorReadings} />
              )}
            </CardContent>
          </Card>
        </div>

        {/* Active high-urgency recommendations */}
        {activeRecommendations.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-sm font-semibold text-brand-800">
              Active High-Urgency Recommendations
            </h2>
            {activeRecommendations.map((r) => (
              <RecommendationCard
                key={r.id}
                adviceType={r.adviceType}
                adviceText={r.adviceText}
                urgencyLevel={r.urgencyLevel}
                issuedAt={r.issuedAt}
                diseaseClass={diseaseLabels[r.classification.diseaseClass]}
              />
            ))}
          </div>
        )}
      </main>
    </>
  );
}
