"use client";

import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/admin/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format, formatDistanceToNow } from "date-fns";
import { FeedbackStatus, FeedbackType } from "@prisma/client";
import { CheckCircle2, RotateCcw, Bug, Lightbulb, Download, Loader2, Eye } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

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
  const [detail, setDetail] = useState<FeedbackRow | null>(null);

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
        <button
          type="button"
          onClick={() => setDetail(row.original)}
          className="max-w-md text-left group"
          title="View full feedback"
        >
          <p className="text-xs text-earth-700 line-clamp-2 group-hover:text-brand-700">
            {row.original.message}
          </p>
          <p className="text-xs text-earth-400 mt-0.5">
            {row.original.email ?? "anonymous"}
            {row.original.appVersion ? ` · v${row.original.appVersion}` : ""}
            {row.original.device ? ` · ${row.original.device}` : ""}
          </p>
        </button>
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
        <div className="flex items-center gap-1.5">
          <Button
            variant="outline"
            size="sm"
            className="h-7 text-xs"
            onClick={() => setDetail(row.original)}
          >
            <Eye size={12} className="mr-1" /> View
          </Button>
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
        </div>
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

      <Dialog open={detail !== null} onOpenChange={(open) => !open && setDetail(null)}>
        <DialogContent className="max-w-lg">
          {detail && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {detail.type === "SUGGESTION" ? (
                    <><Lightbulb size={16} className="text-brand-600" /> Suggestion</>
                  ) : (
                    <><Bug size={16} className="text-alert-high" /> Bug report</>
                  )}
                </DialogTitle>
                <DialogDescription>
                  {detail.email ?? "anonymous"}
                  {detail.appVersion ? ` · v${detail.appVersion}` : ""}
                  {detail.device ? ` · ${detail.device}` : ""}
                  {` · ${format(new Date(detail.createdAt), "dd MMM yyyy HH:mm")}`}
                </DialogDescription>
              </DialogHeader>
              <div className="max-h-[55vh] overflow-y-auto rounded-md bg-earth-50 p-3">
                <p className="text-sm text-earth-800 whitespace-pre-wrap break-words">
                  {detail.message}
                </p>
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={pendingId === detail.id}
                  onClick={() => toggle(detail.id)}
                >
                  {pendingId === detail.id ? (
                    <><Loader2 size={14} className="mr-1.5 animate-spin" /> Saving…</>
                  ) : detail.status === "RESOLVED" ? (
                    <><RotateCcw size={14} className="mr-1.5" /> Reopen</>
                  ) : (
                    <><CheckCircle2 size={14} className="mr-1.5" /> Resolve</>
                  )}
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
