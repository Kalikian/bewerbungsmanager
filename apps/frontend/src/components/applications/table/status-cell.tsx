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
  SelectValue,
} from "@/components/ui/select";

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
    <Select value={current} onValueChange={(v) => update(v as any)}>
      <SelectTrigger className="h-7 w-[110px]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {STATUSES.map((s) => (
          <SelectItem key={s} value={s}>
            {s}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
