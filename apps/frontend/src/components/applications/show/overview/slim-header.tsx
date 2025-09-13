// apps/frontend/components/applications/show/overview/SlimHeader.tsx
"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Pencil, FilePlus, FileUp } from "lucide-react";

export default function SlimHeader({
  title,
  company,
  status, // keep flexible
  onEditAction,
  onAddNoteAction,
  onAddAttachmentAction,
  deleteAction,
}: {
  title: string;
  company?: string;
  status?: string;
  onEditAction?: () => void;
  onAddNoteAction?: () => void;
  onAddAttachmentAction?: () => void;
  deleteAction?: React.ReactNode;
}) {
  return (
    <div className="w-full border-b bg-background/70 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-3">
        <div className="grid gap-2 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
          {/* Titel */}
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
          <div className="flex flex-wrap md:flex-nowrap items-center justify-end gap-2">
            <div className="order-1 shrink-0">
              {onEditAction && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={onEditAction}
                        className="shrink-0 whitespace-nowrap"
                      >
                        <Pencil className="mr-2 h-4 w-4" /> Edit
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Edit this application</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
            <div className="order-3 basis-full md:order-2 md:basis-auto flex justify-end gap-2">
              {onAddNoteAction && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={onAddNoteAction}
                        className="shrink-0 whitespace-nowrap"
                      >
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
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={onAddAttachmentAction}
                        className="shrink-0 whitespace-nowrap"
                      >
                        <FileUp className="mr-2 h-4 w-4" /> Add attachment
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Upload files</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
            {/* Delete comes in ready*/}
            <div className="order-2 md:order-3 shrink-0">{deleteAction}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
