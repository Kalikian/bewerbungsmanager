// apps/frontend/components/applications/show/overview/SlimHeader.tsx
"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Pencil, FilePlus, FileUp, Trash2 } from "lucide-react";

export type SlimHeaderProps = {
  title: string;
  company?: string;
  status?: string;
  onEdit?: () => void;
  onAddNote?: () => void;
  onAddAttachment?: () => void;
  onDelete?: () => void;
};

export default function SlimHeader({
  title,
  company,
  status,
  onEditAction,
  onAddNoteAction,
  onAddAttachmentAction,
  onDeleteAction,
}: {
  title: string;
  company?: string;
  status?: string; // keep flexible
  onEditAction?: () => void;
  onAddNoteAction?: () => void;
  onAddAttachmentAction?: () => void;
  onDeleteAction?: () => void;
}) {
  return (
    <div className="w-full border-b bg-background/70 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          {/* left side: title · company + inline status */}
          <div className="min-w-0">
            <h1 className="truncate text-lg font-semibold leading-tight">
              {title}
              {company ? <span className="text-muted-foreground"> · {company}</span> : null}
              {status ? (
                <Badge variant="secondary" className="ml-2 align-middle">
                  {status}
                </Badge>
              ) : null}
            </h1>
          </div>

          {/* right side: only actions */}
          <div className="flex items-center gap-2">
            {onEditAction && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="secondary" size="sm" onClick={onEditAction}>
                      <Pencil className="mr-2 h-4 w-4" /> Edit
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Edit this application</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            {onAddNoteAction && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="sm" onClick={onAddNoteAction}>
                      <FilePlus className="mr-2 h-4 w-4" /> Add note
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Add a quick note</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            {onAddAttachmentAction && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="sm" onClick={onAddAttachmentAction}>
                      <FileUp className="mr-2 h-4 w-4" /> Add attachment
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Upload files</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            {onDeleteAction && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="destructive" size="sm" onClick={onDeleteAction}>
                      <Trash2 className="mr-2 h-4 w-4" /> Delete
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Permanently delete</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
