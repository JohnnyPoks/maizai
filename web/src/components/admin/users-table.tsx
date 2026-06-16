"use client";

import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/admin/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Role } from "@prisma/client";
import { Trash2, RotateCcw, Ban, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";

type UserRow = {
  id: string;
  fullName: string;
  email: string;
  role: Role;
  disabled: boolean;
  mustChangePassword: boolean;
  lastSignInAt: Date | null;
  createdAt: Date;
};

const roleBadge: Record<Role, string> = {
  SUPER_ADMIN: "bg-brand-100 text-brand-800 border-brand-300",
  ADMIN: "bg-earth-100 text-earth-800 border-earth-300",
  FARMER: "bg-zinc-100 text-zinc-600 border-zinc-300",
};

const roleLabel: Record<Role, string> = {
  SUPER_ADMIN: "Super-Admin",
  ADMIN: "Admin",
  FARMER: "Farmer",
};

export function UsersTable({ data, isSuperAdmin }: { data: UserRow[]; isSuperAdmin: boolean }) {
  const router = useRouter();

  async function resetPassword(id: string) {
    if (!confirm("Reset this user's password? A temporary password will be generated for you to share with them.")) return;
    const res = await fetch(`/api/users/${id}/reset-password`, { method: "POST" });
    if (res.ok) {
      const { tempPassword } = await res.json() as { tempPassword: string };
      alert(`Password reset. Temporary password:\n\n${tempPassword}\n\nShare this with the user. They will be required to change it on next sign-in.`);
    }
    router.refresh();
  }

  async function toggleStatus(id: string) {
    await fetch(`/api/users/${id}/toggle-status`, { method: "POST" });
    router.refresh();
  }

  async function deleteUser(id: string, name: string) {
    if (!confirm(`Delete user "${name}"? This action cannot be undone.`)) return;
    await fetch(`/api/users/${id}`, { method: "DELETE" });
    router.refresh();
  }

  const columns: ColumnDef<UserRow>[] = [
    {
      accessorKey: "fullName",
      header: "Name",
      cell: ({ row }) => (
        <div>
          <p className="font-medium text-brand-900">{row.original.fullName}</p>
          <p className="text-xs text-earth-500">{row.original.email}</p>
        </div>
      ),
    },
    {
      accessorKey: "role",
      header: "Role",
      cell: ({ row }) => (
        <Badge variant="outline" className={`text-xs ${roleBadge[row.original.role]}`}>
          {roleLabel[row.original.role]}
        </Badge>
      ),
    },
    {
      accessorKey: "disabled",
      header: "Status",
      cell: ({ row }) => (
        <Badge
          variant="outline"
          className={row.original.disabled ? "text-alert-high border-alert-high" : "text-brand-700 border-brand-300"}
        >
          {row.original.disabled ? "Disabled" : "Active"}
        </Badge>
      ),
    },
    {
      accessorKey: "lastSignInAt",
      header: "Last Sign-In",
      cell: ({ row }) =>
        row.original.lastSignInAt
          ? format(new Date(row.original.lastSignInAt), "dd MMM yyyy HH:mm")
          : <span className="text-earth-400">Never</span>,
    },
    {
      accessorKey: "createdAt",
      header: "Registered",
      cell: ({ row }) => format(new Date(row.original.createdAt), "dd MMM yyyy"),
    },
    ...(isSuperAdmin
      ? [
          {
            id: "actions",
            header: "Actions",
            cell: ({ row }: { row: { original: UserRow } }) => (
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-earth-400 hover:text-brand-600"
                  title="Reset password"
                  onClick={() => resetPassword(row.original.id)}
                >
                  <RotateCcw size={13} />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-earth-400 hover:text-alert-medium"
                  title={row.original.disabled ? "Enable user" : "Disable user"}
                  onClick={() => toggleStatus(row.original.id)}
                >
                  {row.original.disabled ? <CheckCircle2 size={13} /> : <Ban size={13} />}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-earth-400 hover:text-alert-high"
                  title="Delete user"
                  onClick={() => deleteUser(row.original.id, row.original.fullName)}
                >
                  <Trash2 size={13} />
                </Button>
              </div>
            ),
          } as ColumnDef<UserRow>,
        ]
      : []),
  ];

  return (
    <DataTable
      columns={columns}
      data={data}
      searchPlaceholder="Search users…"
      exportFilename="users"
    />
  );
}
