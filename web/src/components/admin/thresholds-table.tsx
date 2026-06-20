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
import { DiseaseClass, UrgencyLevel } from "@prisma/client";
import { Trash2, ToggleLeft, ToggleRight, Pencil, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

type ThresholdRow = {
  id: string;
  diseaseClass: DiseaseClass;
  parameter: string;
  minValue: number | null;
  maxValue: number | null;
  urgencyLevel: UrgencyLevel;
  adviceType: string;
  adviceText: string;
  active: boolean;
  updatedAt: Date;
};

const diseaseLabels: Record<DiseaseClass, string> = {
  HEALTHY: "Healthy",
  COMMON_RUST: "Common Rust",
  GRAY_LEAF_SPOT: "Gray Leaf Spot",
  BLIGHT: "Blight",
};

const urgencyBadge: Record<UrgencyLevel, string> = {
  HIGH: "text-alert-high border-alert-high",
  MEDIUM: "text-alert-medium border-alert-medium",
  LOW: "text-brand-700 border-brand-300",
};

function EditThresholdDialog({
  threshold,
  onDone,
}: {
  threshold: ThresholdRow;
  onDone: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    minValue: threshold.minValue?.toString() ?? "",
    maxValue: threshold.maxValue?.toString() ?? "",
    urgencyLevel: threshold.urgencyLevel as string,
    adviceType: threshold.adviceType,
    adviceText: threshold.adviceText,
  });

  async function handleSave() {
    setSaving(true);
    await fetch(`/api/thresholds/${threshold.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        minValue: form.minValue !== "" ? parseFloat(form.minValue) : null,
        maxValue: form.maxValue !== "" ? parseFloat(form.maxValue) : null,
        urgencyLevel: form.urgencyLevel,
        adviceType: form.adviceType,
        adviceText: form.adviceText,
      }),
    });
    setSaving(false);
    setOpen(false);
    onDone();
  }

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7 text-earth-400 hover:text-brand-600"
        title="Edit threshold"
        onClick={() => {
          setForm({
            minValue: threshold.minValue?.toString() ?? "",
            maxValue: threshold.maxValue?.toString() ?? "",
            urgencyLevel: threshold.urgencyLevel,
            adviceType: threshold.adviceType,
            adviceText: threshold.adviceText,
          });
          setOpen(true);
        }}
      >
        <Pencil size={13} />
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Edit threshold — {diseaseLabels[threshold.diseaseClass]}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <p className="text-xs font-mono text-earth-500">{threshold.parameter}</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Min value</Label>
                <Input
                  type="number"
                  value={form.minValue}
                  onChange={(e) => setForm({ ...form, minValue: e.target.value })}
                  placeholder="—"
                  className="h-8 text-sm"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Max value</Label>
                <Input
                  type="number"
                  value={form.maxValue}
                  onChange={(e) => setForm({ ...form, maxValue: e.target.value })}
                  placeholder="—"
                  className="h-8 text-sm"
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Urgency level</Label>
              <Select value={form.urgencyLevel} onValueChange={(v) => setForm({ ...form, urgencyLevel: v })}>
                <SelectTrigger className="h-8 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="HIGH">High</SelectItem>
                  <SelectItem value="MEDIUM">Medium</SelectItem>
                  <SelectItem value="LOW">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Advice type</Label>
              <Input
                value={form.adviceType}
                onChange={(e) => setForm({ ...form, adviceType: e.target.value })}
                className="h-8 text-sm"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Advice text</Label>
              <Input
                value={form.adviceText}
                onChange={(e) => setForm({ ...form, adviceText: e.target.value })}
                className="text-sm"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button
              className="bg-brand-500 hover:bg-brand-600 text-white"
              onClick={handleSave}
              disabled={saving}
            >
              {saving && <Loader2 size={13} className="animate-spin mr-1" />}
              Save changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export function ThresholdsTable({ data, isSuperAdmin }: { data: ThresholdRow[]; isSuperAdmin: boolean }) {
  const router = useRouter();

  async function toggleActive(id: string, current: boolean) {
    await fetch(`/api/thresholds/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !current }),
    });
    router.refresh();
  }

  async function deleteThreshold(id: string) {
    if (!confirm("Delete this rule threshold? This will affect future recommendation generation.")) return;
    await fetch(`/api/thresholds/${id}`, { method: "DELETE" });
    router.refresh();
  }

  const columns: ColumnDef<ThresholdRow>[] = [
    {
      accessorKey: "diseaseClass",
      header: "Disease",
      cell: ({ row }) => (
        <span className="text-sm font-medium text-brand-800">
          {diseaseLabels[row.original.diseaseClass]}
        </span>
      ),
    },
    {
      accessorKey: "parameter",
      header: "Parameter",
      cell: ({ row }) => (
        <span className="font-mono text-xs text-earth-600">{row.original.parameter}</span>
      ),
    },
    {
      id: "range",
      header: "Range",
      cell: ({ row }) => {
        const { minValue, maxValue } = row.original;
        if (minValue == null && maxValue == null) return <span className="text-earth-400 text-xs">any</span>;
        if (minValue != null && maxValue == null) return <span className="font-mono text-xs">≥ {minValue}</span>;
        if (minValue == null && maxValue != null) return <span className="font-mono text-xs">≤ {maxValue}</span>;
        return <span className="font-mono text-xs">{minValue} – {maxValue}</span>;
      },
    },
    {
      accessorKey: "urgencyLevel",
      header: "Urgency",
      cell: ({ row }) => (
        <Badge variant="outline" className={cn("text-xs", urgencyBadge[row.original.urgencyLevel])}>
          {row.original.urgencyLevel}
        </Badge>
      ),
    },
    {
      accessorKey: "adviceType",
      header: "Advice Type",
      cell: ({ row }) => (
        <span className="font-mono text-xs text-earth-600">{row.original.adviceType}</span>
      ),
    },
    {
      accessorKey: "adviceText",
      header: "Advice",
      cell: ({ row }) => (
        <p className="text-xs text-earth-700 max-w-xs truncate" title={row.original.adviceText}>
          {row.original.adviceText}
        </p>
      ),
    },
    {
      accessorKey: "active",
      header: "Active",
      cell: ({ row }) =>
        isSuperAdmin ? (
          <Button
            variant="ghost"
            size="icon"
            className={cn("h-7 w-7", row.original.active ? "text-brand-500" : "text-earth-300")}
            onClick={() => toggleActive(row.original.id, row.original.active)}
            title={row.original.active ? "Deactivate" : "Activate"}
          >
            {row.original.active ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
          </Button>
        ) : (
          <Badge variant="outline" className={row.original.active ? "text-brand-700 border-brand-300" : "text-earth-400 border-earth-300"}>
            {row.original.active ? "Active" : "Inactive"}
          </Badge>
        ),
    },
    ...(isSuperAdmin
      ? [
          {
            id: "actions",
            header: "",
            cell: ({ row }: { row: { original: ThresholdRow } }) => (
              <div className="flex items-center gap-1">
                <EditThresholdDialog threshold={row.original} onDone={() => router.refresh()} />
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-earth-400 hover:text-alert-high"
                  onClick={() => deleteThreshold(row.original.id)}
                  title="Delete threshold"
                >
                  <Trash2 size={13} />
                </Button>
              </div>
            ),
          } as ColumnDef<ThresholdRow>,
        ]
      : []),
  ];

  return (
    <DataTable
      columns={columns}
      data={data}
      searchPlaceholder="Search thresholds…"
    />
  );
}
