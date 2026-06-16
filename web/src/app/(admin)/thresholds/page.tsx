export const dynamic = "force-dynamic";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { AdminTopbar } from "@/components/admin/admin-topbar";
import { ThresholdsTable } from "@/components/admin/thresholds-table";
import { EmptyState } from "@/components/admin/empty-state";
import { Sliders } from "lucide-react";
import { Role } from "@prisma/client";

export default async function ThresholdsPage() {
  const session = await auth();
  const role = (session?.user as unknown as { role?: string })?.role ?? "FARMER";
  const isSuperAdmin = role === Role.SUPER_ADMIN;

  const thresholds = await db.ruleThreshold.findMany({
    orderBy: [{ diseaseClass: "asc" }, { createdAt: "asc" }],
  });

  return (
    <>
      <AdminTopbar title="Rule Thresholds" />
      <main className="flex-1 overflow-y-auto p-4 md:p-6">
        {thresholds.length === 0 ? (
          <EmptyState
            icon={Sliders}
            title="No thresholds configured"
            description="Rule thresholds define how the system generates disease recommendations. Run pnpm db:seed to create the defaults."
          />
        ) : (
          <ThresholdsTable data={thresholds} isSuperAdmin={isSuperAdmin} />
        )}
      </main>
    </>
  );
}
