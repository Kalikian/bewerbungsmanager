// apps/frontend/components/applications/show/overview/NotesAndAttachmentsTabs.tsx
"use client";

import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { formatDate } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Pencil, Trash2 } from "lucide-react";

export type NoteItem = { id: string | number; created_at: string; text: string };
export type FileItem = { id: string | number; name: string; size_bytes?: number };

export default function NotesAndAttachmentsTabs({
  notes,
  files,
  onEditNoteAction,
  onDeleteNoteAction,
}: {
  notes: NoteItem[];
  files: FileItem[];
  onEditNoteAction?: (id: string | number, currentText: string) => void;
  onDeleteNoteAction?: (id: string | number) => void;
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
                  <div className="-mt-6 mb-1 flex items-center justify-between">
                    <div className="text-xs text-muted-foreground">{formatDate(n.created_at)}</div>

                    {(onEditNoteAction || onDeleteNoteAction) && (
                      <div className="ml-2 flex items-center gap-1">
                        {onEditNoteAction && (
                          <TooltipProvider delayDuration={200}>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  aria-label="Edit note"
                                  onClick={() => onEditNoteAction(n.id, n.text)}
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Edit</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}

                        {onDeleteNoteAction && (
                          <AlertDialog>
                            <TooltipProvider delayDuration={200}>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <AlertDialogTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="text-destructive hover:text-destructive"
                                      aria-label="Delete note"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </AlertDialogTrigger>
                                </TooltipTrigger>
                                <TooltipContent>Delete</TooltipContent>
                              </Tooltip>
                            </TooltipProvider>

                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete note?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  className="bg-destructive hover:bg-destructive/90"
                                  onClick={() => onDeleteNoteAction(n.id)}
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="text-sm leading-relaxed whitespace-pre-wrap">{n.text}</div>
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
