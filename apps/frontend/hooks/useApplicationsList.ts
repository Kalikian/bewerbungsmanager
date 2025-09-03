"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { API_BASE, getToken, parseJson } from "@/lib/http";
import { Application } from "@shared";
import { sortApplications } from "@/lib/applications/types";

export function useApplicationsList() {
  const [items, setItems] = useState<Application[] | null>(null);
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
      const res = await fetch(`${API_BASE}/applications`, {
        headers: { Authorization: `Bearer ${token}` },
        credentials: "include",
      });
      const body = await parseJson<Application[] | { data?: Application[] }>(res);
      const raw = Array.isArray(body)
        ? body
        : Array.isArray((body as any)?.data)
          ? (body as any).data
          : [];
      setItems(sortApplications(raw));
    } catch (e) {
      console.error(e);
      toast.error("Failed to load applications");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // initial + whenever asked
  useEffect(() => {
    load();
  }, [load]);

  // global reload hook
  useEffect(() => {
    const handler = () => load();
    window.addEventListener("applications:changed", handler);
    return () => window.removeEventListener("applications:changed", handler);
  }, [load]);

  return { items, loading, reload: load, setItems };
}
