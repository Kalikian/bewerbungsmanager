"use client";

import React from "react";
import { MoreHorizontal, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type ApplicationRowOverflowProps = {
  onDeleteAction?: () => void;
  deleteLabel?: string;
  children?: React.ReactNode;
  align?: "start" | "center" | "end";
  disabled?: boolean;
  deleteItem?: React.ReactNode;
};

export default function ApplicationRowOverflow({
  onDeleteAction,
  deleteLabel = "Delete",
  children,
  align = "end",
  disabled,
  deleteItem,
}: ApplicationRowOverflowProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {children ? (
          <span>{children}</span>
        ) : (
          <Button variant="ghost" size="icon" disabled={disabled}>
            <MoreHorizontal className="h-4 w-4" />
            <span className="sr-only">Open menu</span>
          </Button>
        )}
      </DropdownMenuTrigger>

      <DropdownMenuContent align={align}>
        {/* More menu items could be here … */}

        {deleteItem ?? (
          <DropdownMenuItem
            className="text-destructive focus:text-destructive"
            onSelect={(e) => {
              e.preventDefault();
              onDeleteAction?.();
            }}
          >
            <Trash2 className="mr-2 h-4 w-4" /> {deleteLabel}
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
