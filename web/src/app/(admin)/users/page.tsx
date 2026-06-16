export const dynamic = "force-dynamic";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Topbar } from "@/components/admin/topbar";
import { DataTable } from "@/components/admin/data-table";
import { Badge } from "@/components/ui/badge";
import { Role, User } from "@prisma/client";
import { format } from "date-fns";

export default async function UsersPage() {
  const session = await auth();
  const users = await db.user.findMany({
    orderBy: { createdAt: "desc" },
    select: { id: true, fullName: true, email: true, role: true, createdAt: true, updatedAt: true },
  });

  const columns = [
    { key: "fullName", header: "Full Name" },
    { key: "email", header: "E-mail" },
    {
      key: "role",
      header: "Role",
      render: (row: Pick<User, "id" | "fullName" | "email" | "role" | "createdAt" | "updatedAt">) => (
        <Badge
          variant="outline"
          className={row.role === Role.ADMIN ? "text-brand-700 border-brand-300" : ""}
        >
          {row.role}
        </Badge>
      ),
    },
    {
      key: "createdAt",
      header: "Registered",
      render: (row: Pick<User, "id" | "fullName" | "email" | "role" | "createdAt" | "updatedAt">) =>
        format(new Date(row.createdAt), "dd MMM yyyy"),
    },
  ];

  return (
    <>
      <Topbar
        title="Users"
        userEmail={session?.user?.email ?? undefined}
        userName={session?.user?.name ?? undefined}
      />
      <main className="flex-1 overflow-y-auto p-6">
        <DataTable
          columns={columns}
          data={users}
          keyExtractor={(u) => u.id}
          emptyMessage="No users registered yet."
        />
      </main>
    </>
  );
}
