"use client";

import { Trash2 } from "lucide-react";
import DeleteApplicationAction from "@/components/applications/actions/delete-application-action";
import ApplicationRowOverflow from "./application-row-overflow";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";

type Props = {
  id: number;
  title?: string;
  onDeletedAction?: () => void; // callback zum Reload der Tabelle
};

export default function ApplicationRowActions({ id, title, onDeletedAction }: Props) {
  return (
    <ApplicationRowOverflow
      deleteItem={
        <DeleteApplicationAction
          id={id}
          asChild
          onDeletedAction={onDeletedAction}
          confirmTitle="Delete application?"
          confirmDescription={
            title
              ? `This action cannot be undone. „${title}“ will be permanently removed.`
              : "This entry will be permanently removed."
          }
        >
          <DropdownMenuItem
            className="text-destructive focus:text-destructive"
            onSelect={(e) => e.preventDefault()} // wichtig: Menü nicht “selecten”, wir öffnen den Dialog selbst
          >
            <Trash2 className="mr-2 h-4 w-4" /> Delete
          </DropdownMenuItem>
        </DeleteApplicationAction>
      }
    />
  );
}
