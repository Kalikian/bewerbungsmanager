"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { STATUSES } from "@shared";
import { API_BASE, getToken, parseJson } from "@/lib/http";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import type { ApplicationStatus } from "@shared";
import { STATUS_META } from "@/lib/status";
import { StatusBadge, StatusDot } from "@/components/ui/status-badge";

type Props = {
  id: number;
  value: (typeof STATUSES)[number];
  onChangedAction: (next: (typeof STATUSES)[number]) => void;
};

export default function StatusCell({ id, value, onChangedAction }: Props) {
  const [current, setCurrent] = useState(value);
  useEffect(() => setCurrent(value), [value]);

  async function update(next: (typeof STATUSES)[number]) {
    const prev = current;
    setCurrent(next); // optimistic
    const token = getToken();
    try {
      const res = await fetch(`${API_BASE}/applications/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
        body: JSON.stringify({ status: next }),
      });
      if (!res.ok) {
        setCurrent(prev);
        const body = await parseJson<any>(res);
        toast.error(body?.message ?? "Failed to update status");
        return;
      }
      toast.success("Status updated");
      onChangedAction(next);
    } catch {
      setCurrent(prev);
      toast.error("Network error");
    }
  }

  return (
    // current: ApplicationStatus, update: (v: ApplicationStatus) => void
<Select value={current} onValueChange={(v) => update(v as ApplicationStatus)}>
  <SelectTrigger className="h-7 w-[128px] pl-2 pr-8">
    {/* Shows the colored pill instead of plain text */}
    <StatusBadge status={current} size="sm" className="max-w-full justify-center" />
  </SelectTrigger>

  <SelectContent>
    {STATUSES.map((s) => (
      <SelectItem key={s} value={s} className="flex items-center gap-2">
        <div className="flex items-center gap-2">
          <StatusDot status={s as ApplicationStatus} />
          <span>{STATUS_META[s as ApplicationStatus].label}</span>
        </div>
      </SelectItem>
    ))}
  </SelectContent>
</Select>
  );
}
