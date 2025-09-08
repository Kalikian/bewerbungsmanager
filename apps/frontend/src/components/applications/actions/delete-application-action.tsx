// apps/frontend/components/applications/actions/delete-application-action.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { API_BASE, getToken, parseJson } from "@/lib/http";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

type Props = {
  id: number;
  asChild?: boolean; // wrap any trigger (Button, DropdownMenuItem, ...)
  onDeletedAction?: () => void; // optional: after success (e.g. redirect or refetch)
  confirmTitle?: string;
  confirmDescription?: string;
  children?: React.ReactNode; // custom trigger
};

export default function DeleteApplicationAction({
  id,
  asChild,
  onDeletedAction,
  confirmTitle = "Delete this application?",
  confirmDescription = "This action cannot be undone. The application will be permanently removed.",
  children,
}: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const doDelete = async () => {
    try {
      setLoading(true);
      const token = getToken();
      const res = await fetch(`${API_BASE}/applications/${id}`, {
        method: "DELETE",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        credentials: "include",
      });
      const body = await parseJson(res);
      if (!res.ok) {
        toast.error(body?.message ?? "Failed to delete application");
        return;
      }
      toast.success("Application deleted");
      onDeletedAction ? onDeletedAction() : router.push("/applications");
    } catch {
      toast.error("Network error while deleting");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild={!!asChild}>
        {children ?? (
          <Button variant="destructive" size="sm">
            <Trash2 className="mr-2 h-4 w-4" /> Delete
          </Button>
        )}
      </AlertDialogTrigger>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{confirmTitle}</AlertDialogTitle>
          <AlertDialogDescription>{confirmDescription}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={doDelete} disabled={loading}>
            {loading ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
