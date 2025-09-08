"use client";

import * as React from "react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
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
  deleteItem
}: ApplicationRowOverflowProps) {
  return ( 
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{/* … dein Trigger (Kebab) … */}</DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {/* … andere Menüeinträge … */}

        {deleteItem ?? (
          <DropdownMenuItem
            className="text-destructive focus:text-destructive"
            onClick={onDeleteAction}
          >
            Delete
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
