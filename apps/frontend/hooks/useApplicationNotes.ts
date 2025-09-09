// apps/frontend/hooks/useApplicationNotes.ts
"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { listNotes, createNote, updateNote, deleteNote } from "@/lib/api/notes";
import type { Note } from "@shared";

export function useApplicationNotes(applicationId: number) {
  const [items, setItems] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const { res, body } = await listNotes(applicationId);
      if (!res.ok) throw body;
      setItems(Array.isArray(body) ? body : []);
    } catch (err) {
      console.error("notes.load error:", err);
      toast.error("Failed to load notes");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [applicationId]);

  useEffect(() => {
    load();
  }, [load]);

  const add = useCallback(
    async (text: string) => {
      try {
        const { res, body } = await createNote(applicationId, { text });
        if (!res.ok) throw body;
        setItems((xs) => [body as Note, ...xs]);
        toast.success("Note added");
        return body as Note;
      } catch (err) {
        console.error("notes.add error:", err);
        toast.error("Failed to add note");
        return null;
      }
    },
    [applicationId],
  );

  const edit = useCallback(
    async (noteId: number, payload: { text?: string; date?: string }) => {
      try {
        const { res, body } = await updateNote(applicationId, noteId, payload);
        if (!res.ok) {
          console.error("notes.edit status:", res.status, body);
          throw body;
        }
        setItems((xs) => xs.map((n) => (n.id === noteId ? (body as Note) : n)));
        toast.success("Note updated");
        return body as Note;
      } catch (err) {
        console.error("notes.edit error:", err);
        toast.error("Failed to update note");
        return null;
      }
    },
    [applicationId],
  );

  const remove = useCallback(
    async (noteId: number) => {
      const prev = items;
      setItems((xs) => xs.filter((n) => n.id !== noteId)); // optimistic
      try {
        const { res, body } = await deleteNote(applicationId, noteId);
        if (!res.ok) {
          console.error("notes.remove status:", res.status, body);
          throw body;
        }
        toast.success("Note deleted");
        return true;
      } catch (err: any) {
        console.error("notes.remove error:", err);
        setItems(prev); // rollback
        const msg = err?.message ?? err?.error ?? err?.detail ?? "Failed to delete note";
        toast.error(typeof msg === "string" ? msg : "Failed to delete note");
        return false;
      }
    },
    [applicationId, items],
  );

  return { items, loading, reload: load, add, edit, remove, setItems } as const;
}
