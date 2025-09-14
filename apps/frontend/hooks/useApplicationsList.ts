"use client";

import { useCallback, useEffect, useState, useRef } from "react";
import { toast } from "sonner";
import { API_BASE, getToken, parseJson } from "@/lib/http";
import { Application } from "@shared";
import { sortApplicationsByApplied } from "@/lib/applications/types";

export function useApplicationsList() {
  const [items, _setItems] = useState<Application[] | null>(null);
  const [loading, setLoading] = useState(true);
  const inFlightRef = useRef(false);

  const setItems = useCallback((updater: React.SetStateAction<Application[] | null>) => {
    _setItems((prev) => {
      const next =
        typeof updater === "function"
          ? (updater as (p: Application[] | null) => Application[] | null)(prev)
          : updater;
      return next ? sortApplicationsByApplied(next) : next;
    });
  }, []);

  const load = useCallback(async (opts?: { silent?: boolean }) => {
    const silent = !!opts?.silent;

    if (inFlightRef.current) return; // Guard
    inFlightRef.current = true;

    const token = getToken();
    if (!token) {
      _setItems([]);
      if (!silent) setLoading(false);
      inFlightRef.current = false;
      return;
    }

    try {
      if (!silent) setLoading(true);
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
      if (!silent) setLoading(false);
      inFlightRef.current = false;
    }
  }, []);

  // Initial-Load (mit Skeleton)
  useEffect(() => {
    load();
  }, [load]);

  // Globale Reload-Trigger (silent, ohne Skeleton)
  useEffect(() => {
    const onChanged = () => load({ silent: true });
    const onFocus = () => load({ silent: true });
    const onVisible = () => {
      if (document.visibilityState === "visible") load({ silent: true });
    };
    const onOnline = () => load({ silent: true });

    window.addEventListener("applications:changed", onChanged);
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("online", onOnline);

    return () => {
      window.removeEventListener("applications:changed", onChanged);
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("online", onOnline);
    };
  }, [load]);

  // reload bleibt wie gehabt nutzbar (zeigt Skeleton)
  return { items, loading, reload: load, setItems };
}
