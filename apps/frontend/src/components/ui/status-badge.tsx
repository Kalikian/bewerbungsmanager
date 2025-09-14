"use client";
import * as React from "react";
import type { ApplicationStatus } from "@shared";
import { STATUS_META } from "@/lib/status";
import { cn } from "@/lib/utils";

export function StatusBadge({
  status, size = "sm", withIcon = true, className,
}: { status: ApplicationStatus; size?: "sm"|"md"; withIcon?: boolean; className?: string }) {
  const meta = STATUS_META[status];
  const Icon = meta.icon;
  const sz = size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-sm";
  return (
    <span
      className={cn("inline-flex items-center gap-1 rounded-full font-medium ring-1 ring-inset",
        meta.className, sz, className)}
      aria-label={`Status: ${meta.label}`}
      title={meta.label}
    >
      {withIcon && <Icon className="size-3" aria-hidden="true" />}
      {meta.label}
    </span>
  );
}

export const StatusDot = ({ status }: { status: ApplicationStatus }) => (
  <span className={cn("inline-block size-2 rounded-full", STATUS_META[status].dotClassName)} aria-hidden="true" />
);
