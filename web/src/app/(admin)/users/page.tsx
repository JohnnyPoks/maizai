export const dynamic = "force-dynamic";

import { db } from "@/lib/db";
import { AdminTopbar } from "@/components/admin/admin-topbar";
import { UsersTable } from "@/components/admin/users-table";
import { EmptyState } from "@/components/admin/empty-state";
import { Users } from "lucide-react";

export default async function UsersPage() {
  const users = await db.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      fullName: true,
      email: true,
      role: true,
      disabled: true,
      mustChangePassword: true,
      lastSignInAt: true,
      createdAt: true,
    },
  });

  return (
    <>
      <AdminTopbar title="Users" />
      <main className="flex-1 overflow-y-auto p-4 md:p-6">
        {users.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No users yet"
            description="Users will appear here after access requests are approved or when created directly."
          />
        ) : (
          <UsersTable data={users} />
        )}
      </main>
    </>
  );
}
