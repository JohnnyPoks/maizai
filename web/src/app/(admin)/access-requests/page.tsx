export const dynamic = "force-dynamic";

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { AdminTopbar } from "@/components/admin/admin-topbar";
import { AccessRequestsTable } from "@/components/admin/access-requests-table";
import { EmptyState } from "@/components/admin/empty-state";
import { ClipboardList } from "lucide-react";
import { Role } from "@prisma/client";

export default async function AccessRequestsPage() {
  const session = await auth();
  const role = (session?.user as unknown as { role?: string })?.role;
  if (role !== Role.SUPER_ADMIN) redirect("/dashboard");

  const requests = await db.accessRequest.findMany({
    orderBy: { requestedAt: "desc" },
    take: 200,
  });

  return (
    <>
      <AdminTopbar title="Access Requests" />
      <main className="flex-1 overflow-y-auto p-4 md:p-6">
        {requests.length === 0 ? (
          <EmptyState
            icon={ClipboardList}
            title="No access requests yet"
            description="Access requests will appear here when users submit them from the /request-access page."
            action={{ label: "View request page", href: "/request-access" }}
          />
        ) : (
          <AccessRequestsTable data={requests} />
        )}
      </main>
    </>
  );
}
