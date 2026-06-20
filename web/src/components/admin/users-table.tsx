"use client";

import { useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/admin/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import { Role } from "@prisma/client";
import { Trash2, RotateCcw, Ban, CheckCircle2, Pencil, Loader2 } from "lucide-react";
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

function EditRoleDialog({
  user,
  onDone,
}: {
  user: UserRow;
  onDone: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [role, setRole] = useState<Role>(user.role);
  const [loading, setLoading] = useState(false);

  async function handleSave() {
    if (role === user.role) { setOpen(false); return; }
    setLoading(true);
    await fetch(`/api/users/${user.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role }),
    });
    setLoading(false);
    setOpen(false);
    onDone();
  }

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7 text-earth-400 hover:text-brand-600"
        title="Edit role"
        onClick={() => { setRole(user.role); setOpen(true); }}
      >
        <Pencil size={13} />
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit user: {user.fullName}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <p className="text-sm text-earth-600">{user.email}</p>
            <div className="space-y-1">
              <Label>Role</Label>
              <Select value={role} onValueChange={(v) => setRole(v as Role)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={Role.SUPER_ADMIN}>Super-Admin</SelectItem>
                  <SelectItem value={Role.ADMIN}>Admin</SelectItem>
                  <SelectItem value={Role.FARMER}>Farmer</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button
              className="bg-brand-500 hover:bg-brand-600 text-white"
              onClick={handleSave}
              disabled={loading || role === user.role}
            >
              {loading && <Loader2 size={13} className="animate-spin mr-1" />}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

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
    if (!confirm(`Delete user "${name}"? Their data will be retained but their account will be permanently removed.`)) return;
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
                <EditRoleDialog user={row.original} onDone={() => router.refresh()} />
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
    />
  );
}
