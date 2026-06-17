"use client";

import { useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/admin/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format, formatDistanceToNow } from "date-fns";
import { AccessRequestStatus, Role } from "@prisma/client";
import { CheckCircle2, XCircle, ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

type AccessRequestRow = {
  id: string;
  fullName: string;
  email: string;
  affiliation: string | null;
  reason: string;
  status: AccessRequestStatus;
  requestedAt: Date;
  reviewedAt: Date | null;
  notes: string | null;
};

const statusBadge: Record<AccessRequestStatus, string> = {
  PENDING: "text-alert-medium border-alert-medium",
  APPROVED: "text-brand-700 border-brand-300",
  DENIED: "text-alert-high border-alert-high",
};

function ReasonCell({ reason }: { reason: string }) {
  const [expanded, setExpanded] = useState(false);
  const truncated = reason.length > 80;
  return (
    <div className="max-w-xs">
      <p className="text-xs text-earth-700">
        {expanded || !truncated ? reason : reason.slice(0, 80) + "…"}
      </p>
      {truncated && (
        <button
          className="text-xs text-brand-600 hover:underline mt-0.5 flex items-center gap-0.5"
          onClick={() => setExpanded((e) => !e)}
        >
          {expanded ? <><ChevronUp size={11} /> less</> : <><ChevronDown size={11} /> more</>}
        </button>
      )}
    </div>
  );
}

function ApproveDialog({ id, fullName, onDone }: { id: string; fullName: string; onDone: () => void }) {
  const [open, setOpen] = useState(false);
  const [role, setRole] = useState<Role>(Role.ADMIN);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleApprove() {
    setLoading(true);
    await fetch(`/api/access-requests/${id}/approve`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ approvedRole: role, notes: notes || undefined }),
    });
    setLoading(false);
    setOpen(false);
    onDone();
  }

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="h-7 text-xs border-brand-300 text-brand-700 hover:bg-brand-50"
        onClick={() => setOpen(true)}
      >
        <CheckCircle2 size={12} className="mr-1" /> Approve
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve access request</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <p className="text-sm text-earth-600">
              Approving access for <b>{fullName}</b>. A temporary password will be generated and
              displayed to them the next time they visit the sign-in page.
            </p>
            <div className="space-y-1">
              <Label>Role to grant</Label>
              <Select value={role} onValueChange={(v) => setRole(v as Role)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={Role.ADMIN}>Admin</SelectItem>
                  <SelectItem value={Role.FARMER}>Farmer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Internal note (optional)</Label>
              <Input
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Research collaborator, University of Buea"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button className="bg-brand-500 hover:bg-brand-600 text-white" onClick={handleApprove} disabled={loading}>
              {loading && <Loader2 size={13} className="animate-spin mr-1" />}
              Approve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function DenyDialog({ id, onDone }: { id: string; onDone: () => void }) {
  const [open, setOpen] = useState(false);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleDeny() {
    setLoading(true);
    await fetch(`/api/access-requests/${id}/deny`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notes: notes || undefined }),
    });
    setLoading(false);
    setOpen(false);
    onDone();
  }

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="h-7 text-xs border-alert-high/30 text-alert-high hover:bg-red-50"
        onClick={() => setOpen(true)}
      >
        <XCircle size={12} className="mr-1" /> Deny
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Deny access request</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1">
              <Label>Reason for denial (optional, sent to applicant)</Label>
              <Input
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Insufficient information provided"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button className="bg-alert-high hover:bg-red-700 text-white" onClick={handleDeny} disabled={loading}>
              {loading && <Loader2 size={13} className="animate-spin mr-1" />}
              Deny
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export function AccessRequestsTable({ data }: { data: AccessRequestRow[] }) {
  const router = useRouter();

  const columns: ColumnDef<AccessRequestRow>[] = [
    {
      accessorKey: "fullName",
      header: "Applicant",
      cell: ({ row }) => (
        <div>
          <p className="font-medium text-brand-900 text-sm">{row.original.fullName}</p>
          <p className="text-xs text-earth-500">{row.original.email}</p>
          {row.original.affiliation && (
            <p className="text-xs text-earth-400 italic">{row.original.affiliation}</p>
          )}
        </div>
      ),
    },
    {
      accessorKey: "reason",
      header: "Reason",
      cell: ({ row }) => <ReasonCell reason={row.original.reason} />,
    },
    {
      accessorKey: "requestedAt",
      header: "Requested",
      cell: ({ row }) => (
        <span title={format(new Date(row.original.requestedAt), "dd MMM yyyy HH:mm")}>
          {formatDistanceToNow(new Date(row.original.requestedAt), { addSuffix: true })}
        </span>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <Badge variant="outline" className={cn("text-xs", statusBadge[row.original.status])}>
          {row.original.status}
        </Badge>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) =>
        row.original.status === "PENDING" ? (
          <div className="flex items-center gap-2">
            <ApproveDialog
              id={row.original.id}
              fullName={row.original.fullName}
              onDone={() => router.refresh()}
            />
            <DenyDialog id={row.original.id} onDone={() => router.refresh()} />
          </div>
        ) : (
          <div>
            {row.original.reviewedAt && (
              <p className="text-xs text-earth-400">
                Reviewed {formatDistanceToNow(new Date(row.original.reviewedAt), { addSuffix: true })}
              </p>
            )}
            {row.original.notes && (
              <p className="text-xs text-earth-500 italic">{row.original.notes}</p>
            )}
          </div>
        ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={data}
      searchPlaceholder="Search requests…"
      exportFilename="access-requests"
    />
  );
}
