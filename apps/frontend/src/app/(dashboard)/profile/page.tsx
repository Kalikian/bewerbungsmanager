"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../context/authProvider";
import { getToken } from "@/lib/http";

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
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { CheckCircle2 } from "lucide-react";

import { updateUserNameSchema } from "@shared";

export default function ProfilePage() {
  const { user, loading, refreshMe } = useAuth();
  const router = useRouter();

  /* ---------- Dialog-State ---------- */
  const [open, setOpen] = useState(false);
  const [firstName, setFirstName] = useState(user?.firstName ?? "");
  const [lastName, setLastName] = useState(user?.lastName ?? "");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Redirect, wenn nicht eingeloggt
  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [loading, user, router]);

  // Formfelder synchron halten, wenn der User neu geladen wird
  useEffect(() => {
    setFirstName(user?.firstName ?? "");
    setLastName(user?.lastName ?? "");
  }, [user?.firstName, user?.lastName]);

  // Jetzt erst die frühen Returns
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
    setSuccess(false);

    const result = updateUserNameSchema.safeParse({ firstName, lastName });
    if (!result.success) {
      const msg = result.error.issues[0]?.message ?? "Invalid input.";
      setError(msg);
      return;
    }

    const payload = result.data;

    try {
      setSubmitting(true);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/user/account`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError(body?.message ?? "Update failed.");
        return;
      }

      await refreshMe(); // User reload
      setSuccess(true); //Success
      // Close dialog after timeout & reset status
      setTimeout(() => {
        setOpen(false);
        setSuccess(false);
        setError(null);
      }, 1000);
    } catch {
      setError("Network error. Please try again later..");
    } finally {
      setSubmitting(false);
    }
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

      {/* Edit-Button → Modal */}
      <Dialog
        open={open}
        onOpenChange={(v) => {
          setOpen(v);
          setError(null);
          setSuccess(false);
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
                disabled={submitting || success}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="lastName">last name</Label>
              <Input
                id="lastName"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                autoComplete="family-name"
                disabled={submitting || success}
              />
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            {success && (
              <p
                className="text-sm text-emerald-600 flex items-center gap-2"
                role="status"
                aria-live="polite"
              >
                <CheckCircle2 className="h-4 w-4" />
                Profile updated successfully
              </p>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button onClick={onSubmit} disabled={submitting}>
              {submitting ? "updating…" : "Update"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
