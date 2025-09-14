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
        {/* 2 columns on large screens: [title(+status)] [actions] */}
        <div className="grid gap-2 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
          {/* Left: title/company and the status badge kept left-aligned */}
          <div className="min-w-0">
            {/* Flex keeps the badge visible (shrink-0) while the title can truncate */}
            <div className="flex items-center gap-2 flex-wrap">
              {/* min-w-0 enables truncation inside grid/flex containers */}
              <h1 className="min-w-0 truncate text-lg font-semibold leading-tight">
                {title}
                {company ? <span className="text-muted-foreground"> · {company}</span> : null}
              </h1>

              {/* Status left-aligned, with small spacing; never truncated */}
              {status ? (
                <StatusBadge status={status} size="md" className="shrink-0 ml-1" />
              ) : null}
            </div>
          </div>

          {/* Right side: actions (unchanged) */}
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
