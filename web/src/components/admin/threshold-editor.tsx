"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { RuleThreshold, UrgencyLevel } from "@prisma/client";
import { Pencil, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

interface ThresholdEditorProps {
  threshold: RuleThreshold;
}

const urgencyColors: Record<UrgencyLevel, string> = {
  HIGH: "bg-alert-high/10 text-alert-high",
  MEDIUM: "bg-alert-medium/10 text-alert-medium",
  LOW: "bg-alert-low/10 text-alert-low",
};

export function ThresholdEditor({ threshold }: ThresholdEditorProps) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    minValue: threshold.minValue?.toString() ?? "",
    maxValue: threshold.maxValue?.toString() ?? "",
    urgencyLevel: threshold.urgencyLevel as string,
    adviceType: threshold.adviceType,
    adviceText: threshold.adviceText,
    active: threshold.active,
  });

  async function save() {
    setSaving(true);
    await fetch("/api/thresholds", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: threshold.id,
        minValue: form.minValue ? parseFloat(form.minValue) : null,
        maxValue: form.maxValue ? parseFloat(form.maxValue) : null,
        urgencyLevel: form.urgencyLevel,
        adviceType: form.adviceType,
        adviceText: form.adviceText,
        active: form.active,
      }),
    });
    setSaving(false);
    setEditing(false);
    router.refresh();
  }

  if (!editing) {
    return (
      <div className="flex items-start justify-between gap-4 rounded-lg border border-brand-100 p-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono text-xs text-earth-500">{threshold.parameter}</span>
            <Badge variant="outline" className={cn("text-xs", urgencyColors[threshold.urgencyLevel])}>
              {threshold.urgencyLevel}
            </Badge>
            {!threshold.active && (
              <Badge variant="outline" className="text-xs text-earth-400">Inactive</Badge>
            )}
          </div>
          <p className="mt-1 text-sm font-medium text-brand-800">{threshold.adviceType}</p>
          <p className="mt-0.5 text-xs text-earth-600 leading-relaxed">{threshold.adviceText}</p>
          <div className="mt-1 flex gap-3 text-xs text-earth-400 font-mono">
            {threshold.minValue !== null && <span>min: {threshold.minValue}</span>}
            {threshold.maxValue !== null && <span>max: {threshold.maxValue}</span>}
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={() => setEditing(true)}>
          <Pencil size={14} />
        </Button>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-brand-300 bg-brand-50 p-4 space-y-3">
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
        <Label className="text-xs">Urgency</Label>
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
        <Label className="text-xs">Advice text</Label>
        <Input
          value={form.adviceText}
          onChange={(e) => setForm({ ...form, adviceText: e.target.value })}
          className="text-sm"
        />
      </div>

      <div className="flex gap-2 justify-end">
        <Button variant="ghost" size="sm" onClick={() => setEditing(false)}>
          <X size={14} className="mr-1" /> Cancel
        </Button>
        <Button
          size="sm"
          className="bg-brand-500 hover:bg-brand-600 text-white"
          onClick={save}
          disabled={saving}
        >
          <Check size={14} className="mr-1" /> Save
        </Button>
      </div>
    </div>
  );
}
