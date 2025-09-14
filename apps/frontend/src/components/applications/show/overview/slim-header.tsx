// apps/frontend/components/applications/show/overview/SlimHeader.tsx
"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Pencil, FilePlus, FileUp } from "lucide-react";
import { StatusBadge } from "@/components/ui/status-badge";
import type { ApplicationStatus } from "@shared";

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
  status?: ApplicationStatus;
  onEditAction?: () => void;
  onAddNoteAction?: () => void;
  onAddAttachmentAction?: () => void;
  deleteAction?: React.ReactNode;
}) {
  return (
    <div className="w-full border-b bg-background/70 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-3">
        {/* On large screens use 3 columns: [title] [status] [actions].
           This keeps the status always visible and avoids truncation by long company names. */}
        <div className="grid gap-2 lg:grid-cols-[minmax(0,1fr)_auto_auto] lg:items-center">
          {/* Title / Company — min-w-0 enables text truncation (ellipsis) inside grids */}
          <div className="min-w-0">
            <h1 className="truncate text-lg font-semibold leading-tight">
              {title}
              {company ? <span className="text-muted-foreground"> · {company}</span> : null}
            </h1>
          </div>

          {/* Status — separated cell so it never gets truncated by the title/company */}
          {status ? (
            <div className="lg:justify-self-start">
              <StatusBadge status={status} size="md" className="shrink-0" />
            </div>
          ) : (
            // Keep grid structure consistent when no status is provided
            <div className="hidden lg:block" />
          )}

          {/* Right side: only actions */}
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

            {/* Delete comes in ready */}
            <div className="order-2 md:order-3 shrink-0">{deleteAction}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
