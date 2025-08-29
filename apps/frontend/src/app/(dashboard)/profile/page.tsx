"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../context/authProvider";
import type {UserPublic} from "@shared";

export default function ProfilePage() {
  const { user, loading, refreshMe } = useAuth();
  const router = useRouter();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [loading, user, router]);

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-10">
        <p className="opacity-80">Profil wird geladen…</p>
      </div>
    );
  }

  // Should not happen due to redirect, but just in case
  if (!user) return null;

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
          <span className="font-medium">Name:</span> {(user as UserPublic ).firstName ?? "—"}{" "}
          {(user as UserPublic).lastName ?? ""}
        </div>
      </div>

      <button
        onClick={refreshMe}
        className="rounded-lg px-4 py-2 text-sm font-medium border bg-background hover:bg-accent transition"
      >
        Neu laden
      </button>
    </div>
  );
}
