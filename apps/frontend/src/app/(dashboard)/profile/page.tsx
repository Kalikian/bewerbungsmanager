"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../context/authProvider";
import { getToken, clearToken } from "@/lib/http";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { ConfirmDialog } from "@components/ui/confirm-dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { updateUserNameSchema } from "@shared";
import { toast } from "sonner";

export default function ProfilePage() {
  const { user, loading, refreshMe } = useAuth();
  const router = useRouter();

  // ----- edit dialog state -----
  const [open, setOpen] = useState(false);
  const [firstName, setFirstName] = useState(user?.firstName ?? "");
  const [lastName, setLastName] = useState(user?.lastName ?? "");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [loading, user, router]);

  useEffect(() => {
    setFirstName(user?.firstName ?? "");
    setLastName(user?.lastName ?? "");
  }, [user?.firstName, user?.lastName]);

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-10">
        <p className="opacity-80">Profile is loading…</p>
      </div>
    );
  }
  if (!user) return null;

  async function onSubmit() {
    setError(null);

    const parsed = updateUserNameSchema.safeParse({ firstName, lastName });
    if (!parsed.success) {
      const msg = parsed.error.issues[0]?.message ?? "Invalid input.";
      setError(msg);
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/user/account`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        credentials: "include",
        body: JSON.stringify(parsed.data),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError(body?.message ?? "Update failed.");
        return;
      }

      await refreshMe();

      toast.success("Profile updated successfully");
      setOpen(false);
    } catch {
      setError("Network error. Please try again later.");
    } finally {
      setSubmitting(false);
    }
  }

  // ---- delete account (used by ConfirmDialog) ----
  async function onConfirmDelete() {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/user/account`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${getToken()}` },
      credentials: "include",
    });

    if (!res.ok) {
      const txt = await res.text().catch(() => "");
      throw new Error(txt || `Deletion failed (HTTP ${res.status})`);
    }
    // success → clear token; navigation and toast are handled in onSuccessAction
    clearToken();
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-10 space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Profil</h1>

      <div className="rounded-xl border p-5 bg-card text-card-foreground shadow-sm space-y-2">
        <div>
          <span className="font-medium">User-ID:</span> {user.id}
        </div>
        <div>
          <span className="font-medium">E-Mail:</span> {user.email}
        </div>
        <div>
          <span className="font-medium">Name:</span>{" "}
          {(user.firstName ?? "—") + " " + (user.lastName ?? "")}
        </div>
      </div>

      <div className="flex gap-6">
        {/* Update profile dialog */}
        <Dialog
          open={open}
          onOpenChange={(v) => {
            setOpen(v);
            setError(null);
          }}
        >
          <DialogTrigger asChild>
            <Button size="sm">Update profile</Button>
          </DialogTrigger>

          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Update profile</DialogTitle>
              <DialogDescription>
                Change your first or last name. Empty fields remain unchanged.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-2">
              <div className="grid gap-2">
                <Label htmlFor="firstName">first name</Label>
                <Input
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  autoComplete="given-name"
                  disabled={submitting /* || success */} // ✅ no success state
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="lastName">last name</Label>
                <Input
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  autoComplete="family-name"
                  disabled={submitting /* || success */} // ✅ no success state
                />
              </div>

              {/* Keep inline error (only success moved to toast) */}
              {error && <p className="text-sm text-destructive">{error}</p>}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)} disabled={submitting}>
                Cancel
              </Button>
              <Button onClick={onSubmit} disabled={submitting /* || success */}>
                {submitting ? "updating…" : "Update"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete account dialog — success handled via toast + redirect */}
        <ConfirmDialog
          title="Delete profile permanently?"
          description={
            <>
              This action <b>cannot</b> be undone. Your account and all associated data will be
              deleted.
            </>
          }
          confirmText="Yes, delete"
          cancelText="Cancel"
          variant="destructive"
          onConfirmAction={onConfirmDelete}
          onSuccessAction={() => {
            window.dispatchEvent(new Event("auth:changed"));
            toast.success("Your profile has been deleted.");
            router.replace("/");
          }}
        >
          <Button variant="destructive" size="sm">
            Delete profile
          </Button>
        </ConfirmDialog>
      </div>
    </div>
  );
}
