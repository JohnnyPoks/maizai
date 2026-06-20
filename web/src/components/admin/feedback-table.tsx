"use client";

import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/admin/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format, formatDistanceToNow } from "date-fns";
import { FeedbackStatus, FeedbackType } from "@prisma/client";
import { CheckCircle2, RotateCcw, Bug, Lightbulb } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

type FeedbackRow = {
  id: string;
  type: FeedbackType;
  message: string;
  email: string | null;
  appVersion: string | null;
  device: string | null;
  status: FeedbackStatus;
  createdAt: Date;
};

export function FeedbackTable({ data }: { data: FeedbackRow[] }) {
  const router = useRouter();

  async function toggle(id: string) {
    await fetch(`/api/feedback/${id}`, { method: "PATCH" });
    router.refresh();
  }

  const columns: ColumnDef<FeedbackRow>[] = [
    {
      accessorKey: "type",
      header: "Type",
      cell: ({ row }) =>
        row.original.type === "SUGGESTION" ? (
          <Badge variant="outline" className="text-xs text-brand-700 border-brand-300">
            <Lightbulb size={11} className="mr-1" /> Suggestion
          </Badge>
        ) : (
          <Badge variant="outline" className="text-xs text-alert-high border-alert-high">
            <Bug size={11} className="mr-1" /> Bug
          </Badge>
        ),
    },
    {
      accessorKey: "message",
      header: "Message",
      cell: ({ row }) => (
        <div className="max-w-md">
          <p className="text-xs text-earth-700 whitespace-pre-wrap">{row.original.message}</p>
          <p className="text-xs text-earth-400 mt-0.5">
            {row.original.email ?? "anonymous"}
            {row.original.appVersion ? ` · v${row.original.appVersion}` : ""}
            {row.original.device ? ` · ${row.original.device}` : ""}
          </p>
        </div>
      ),
    },
    {
      accessorKey: "createdAt",
      header: "Received",
      cell: ({ row }) => (
        <span title={format(new Date(row.original.createdAt), "dd MMM yyyy HH:mm")}>
          {formatDistanceToNow(new Date(row.original.createdAt), { addSuffix: true })}
        </span>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <Badge
          variant="outline"
          className={cn(
            "text-xs",
            row.original.status === "RESOLVED"
              ? "text-brand-700 border-brand-300"
              : "text-alert-medium border-alert-medium"
          )}
        >
          {row.original.status}
        </Badge>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <Button
          variant="outline"
          size="sm"
          className="h-7 text-xs"
          onClick={() => toggle(row.original.id)}
        >
          {row.original.status === "RESOLVED" ? (
            <><RotateCcw size={12} className="mr-1" /> Reopen</>
          ) : (
            <><CheckCircle2 size={12} className="mr-1" /> Resolve</>
          )}
        </Button>
      ),
    },
  ];

  return <DataTable columns={columns} data={data} searchPlaceholder="Search feedback…" />;
}
