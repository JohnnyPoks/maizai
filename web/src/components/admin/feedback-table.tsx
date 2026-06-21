"use client";

import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/admin/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format, formatDistanceToNow } from "date-fns";
import { FeedbackStatus, FeedbackType } from "@prisma/client";
import { CheckCircle2, RotateCcw, Bug, Lightbulb, Download, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
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
  const [pendingId, setPendingId] = useState<string | null>(null);

  async function toggle(id: string) {
    setPendingId(id);
    try {
      await fetch(`/api/feedback/${id}`, { method: "PATCH" });
      router.refresh();
    } finally {
      setPendingId(null);
    }
  }

  function exportMarkdown() {
    const lines = [`# MaizAI Feedback (${data.length} items, exported ${format(new Date(), "dd MMM yyyy HH:mm")})`, ""];
    for (const f of data) {
      lines.push(`## [${f.type}] ${f.status} — ${format(new Date(f.createdAt), "dd MMM yyyy HH:mm")}`);
      lines.push(
        `From: ${f.email ?? "anonymous"}${f.appVersion ? ` · v${f.appVersion}` : ""}${f.device ? ` · ${f.device}` : ""}`,
      );
      lines.push("", f.message, "", "---", "");
    }
    const blob = new Blob([lines.join("\n")], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `maizai-feedback-${new Date().toISOString().slice(0, 10)}.md`;
    a.click();
    URL.revokeObjectURL(url);
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
          disabled={pendingId === row.original.id}
          onClick={() => toggle(row.original.id)}
        >
          {pendingId === row.original.id ? (
            <><Loader2 size={12} className="mr-1 animate-spin" /> Saving…</>
          ) : row.original.status === "RESOLVED" ? (
            <><RotateCcw size={12} className="mr-1" /> Reopen</>
          ) : (
            <><CheckCircle2 size={12} className="mr-1" /> Resolve</>
          )}
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs" onClick={exportMarkdown}>
          <Download size={13} /> Export Markdown
        </Button>
      </div>
      <DataTable columns={columns} data={data} searchPlaceholder="Search feedback…" />
    </div>
  );
}
