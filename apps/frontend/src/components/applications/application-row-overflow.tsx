"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, Trash2 } from "lucide-react";

type RowOverflowProps = {
  onDeleteAction?: () => void;
  deleteLabel?: string;
  children?: React.ReactNode;
  align?: "start" | "center" | "end";
  disabled?: boolean;
};

export default function RowOverflow({
  onDeleteAction,
  deleteLabel = "Delete",
  children,
  align = "end",
  disabled,
}: RowOverflowProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label="More actions"
          disabled={disabled}
          data-slot="row-overflow-trigger"
        >
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align={align} className="w-44">
        {children}
        {onDeleteAction && (
          <DropdownMenuItem
            onClick={onDeleteAction}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            {deleteLabel}
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
