"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { API_BASE, getToken, parseJson } from "@/lib/http";
import type { Note } from "@shared";

export function useApplicationNotes(applicationId: number) {
  const [items, setItems] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const token = getToken();
    if (!token) {
      setItems([]);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/applications/${applicationId}/notes`, {
        headers: { Authorization: `Bearer ${token}` },
        credentials: "include",
      });
      const body = await parseJson<Note[]>(res);
      if (!res.ok) throw body as any;
      setItems(Array.isArray(body) ? body : []);
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to load notes");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [applicationId]);

  useEffect(() => {
    load();
  }, [load]);

  return { items, loading, reload: load, setItems } as const;
}
