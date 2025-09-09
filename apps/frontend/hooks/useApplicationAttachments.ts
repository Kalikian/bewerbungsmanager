"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { getToken } from "@/lib/http";
import { listAttachments } from "@/lib/api/attachment";
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
      const { res, body } = await listAttachments(applicationId);
      if (!res.ok) throw body as any;
      // Be defensive: ensure we always store an array
      setItems(Array.isArray(body) ? body : []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load attachments");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [applicationId]);
  // Load on mount and whenever applicationId changes
  useEffect(() => {
    load();
  }, [load]);
  // Expose current items, loading state, and a manual reload
  return { items, loading, reload: load, setItems } as const;
}
