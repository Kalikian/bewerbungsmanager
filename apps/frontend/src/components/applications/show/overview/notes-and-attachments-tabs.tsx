// apps/frontend/components/applications/show/overview/NotesAndAttachmentsTabs.tsx
"use client";

import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { formatDate } from "@/lib/format";

export type NoteItem = { id: string | number; created_at: string; text: string };
export type FileItem = { id: string | number; name: string; size_bytes?: number };

export default function NotesAndAttachmentsTabs({
  notes,
  files,
}: {
  notes: NoteItem[];
  files: FileItem[];
}) {
  return (
    <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pb-10">
      <Tabs defaultValue="notes" className="w-full">
        <TabsList>
          <TabsTrigger value="notes">Notes ({notes.length})</TabsTrigger>
          <TabsTrigger value="files">Attachments ({files.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="notes" className="mt-4">
          <div className="space-y-3">
            {notes.map((n) => (
              <Card key={n.id}>
                <CardContent className="pt-4">
                  <div className="mb-1 text-xs text-muted-foreground">
                    {formatDate(n.created_at)}
                  </div>
                  <div className="text-sm leading-relaxed">{n.text}</div>
                </CardContent>
              </Card>
            ))}
            {notes.length === 0 && (
              <div className="rounded-md border p-4 text-sm text-muted-foreground">
                No notes yet.
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="files" className="mt-4">
          <div className="space-y-2">
            {files.map((f) => (
              <div
                key={f.id}
                className="flex items-center justify-between rounded-md border p-3 text-sm"
              >
                <span className="truncate">{f.name}</span>
                {typeof f.size_bytes === "number" ? (
                  <span className="text-xs text-muted-foreground">
                    {(f.size_bytes / 1024).toFixed(1)} KB
                  </span>
                ) : null}
              </div>
            ))}
            {files.length === 0 && (
              <div className="rounded-md border p-4 text-sm text-muted-foreground">No files.</div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </section>
  );
}
