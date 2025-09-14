"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { API_BASE, getToken, parseJson } from "@/lib/http";
import { Application } from "@shared";
import { sortApplicationsByApplied } from "@/lib/applications/types";

export function useApplicationsList() {
  const [items, _setItems] = useState<Application[] | null>(null);
  const [loading, setLoading] = useState(true);

    const setItems = useCallback(
    (updater: React.SetStateAction<Application[] | null>) => {
      _setItems((prev) => {
        const next =
          typeof updater === "function"
            ? (updater as (p: Application[] | null) => Application[] | null)(prev)
            : updater;
        return next ? sortApplicationsByApplied(next) : next;
      });
    },
    [],
  );

  const load = useCallback(async () => {
    const token = getToken();
    if (!token) {
      _setItems([]);
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
      _setItems(sortApplicationsByApplied(raw));
    } catch (e) {
      console.error(e);
      toast.error("Failed to load applications");
      _setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const handler = () => load();
    window.addEventListener("applications:changed", handler);
    return () => window.removeEventListener("applications:changed", handler);
  }, [load]);

  return { items, loading, reload: load, setItems };
}
