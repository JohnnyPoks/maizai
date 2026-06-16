export const dynamic = "force-dynamic";

import { db } from "@/lib/db";
import { AdminTopbar } from "@/components/admin/admin-topbar";
import { ClassificationsTable } from "@/components/admin/classifications-table";
import { EmptyState } from "@/components/admin/empty-state";
import { Microscope } from "lucide-react";

export default async function ClassificationsPage() {
  const classifications = await db.classification.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
    include: {
      image: { include: { user: { select: { fullName: true } } } },
      recommendations: { select: { id: true } },
    },
  });

  return (
    <>
      <AdminTopbar title="Classifications" />
      <main className="flex-1 overflow-y-auto p-4 md:p-6">
        {classifications.length === 0 ? (
          <EmptyState
            icon={Microscope}
            title="No classifications yet"
            description="Classifications will appear here once farmers begin capturing maize leaf images through the mobile application."
            action={{ label: "View the mobile app", href: "/#download" }}
          />
        ) : (
          <ClassificationsTable data={classifications} />
        )}
      </main>
    </>
  );
}
