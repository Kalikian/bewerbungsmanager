"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { getToken } from "@/lib/http";
import { messageFromApiError } from "@/lib/api-errors";
import { getApplicationById } from "@/lib/api/applications";
import type { Application as AppEntity } from "@shared";

export function useApplication(id: number) {
  const [entity, setEntity] = useState<AppEntity | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const token = getToken();
    if (!token) {
      setEntity(null);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const data = await getApplicationById(id, token);
      setEntity(data);
    } catch (err: any) {
      toast.error(messageFromApiError(err, "Failed to load application"));
      setEntity(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  return { entity, loading, reload: load };
}
