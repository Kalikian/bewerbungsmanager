"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { API_BASE, getToken, parseJson } from "@/lib/http";
import type { AttachmentRow } from "@shared";

export function useApplicationAttachments(applicationId: number) {
  const [items, setItems] = useState<AttachmentRow[]>([]);
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
      const res = await fetch(`${API_BASE}/applications/${applicationId}/attachments`, {
        headers: { Authorization: `Bearer ${token}` },
        credentials: "include",
      });
      const body = await parseJson<AttachmentRow[]>(res);
      if (!res.ok) throw body as any;
      setItems(Array.isArray(body) ? body : []);
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to load attachments");
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
