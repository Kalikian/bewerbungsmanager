"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { listNotes, createNote, updateNote, deleteNote } from "@/lib/api/notes";
import type { Note } from "@shared";

export function useApplicationNotes(applicationId: number) {
  const [items, setItems] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);

  // Load all notes
  const load = useCallback(async () => {
    try {
      setLoading(true);
      const { res, body } = await listNotes(applicationId);
      if (!res.ok) throw body;
      setItems(Array.isArray(body) ? body : []);
    } catch (err) {
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

  // Create a new note
  const add = useCallback(
    async (content: string) => {
      try {
        const { res, body } = await createNote(applicationId, { content });
        if (!res.ok) throw body;
        setItems((xs) => [body, ...xs]);
        toast.success("Note added");
        return body;
      } catch (err) {
        console.error(err);
        toast.error("Failed to add note");
        return null;
      }
    },
    [applicationId],
  );

  // Update an existing note
  const edit = useCallback(
    async (noteId: number, payload: { content?: string }) => {
      try {
        const { res, body } = await updateNote(applicationId, noteId, payload);
        if (!res.ok) throw body;
        setItems((xs) => xs.map((n) => (n.id === noteId ? body : n)));
        toast.success("Note updated");
        return body;
      } catch (err) {
        console.error(err);
        toast.error("Failed to update note");
        return null;
      }
    },
    [applicationId],
  );

  // Delete a note
  const remove = useCallback(
    async (noteId: number) => {
      try {
        const { res } = await deleteNote(applicationId, noteId);
        if (!res.ok) throw new Error("Delete failed");
        setItems((xs) => xs.filter((n) => n.id !== noteId));
        toast.success("Note deleted");
        return true;
      } catch (err) {
        console.error(err);
        toast.error("Failed to delete note");
        return false;
      }
    },
    [applicationId],
  );

  return {
    items,
    loading,
    reload: load,
    add,
    edit,
    remove,
    setItems,
  } as const;
}
