"use client";

import React, { use } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { getToken} from "@/lib/http";
import { useEffect, useState } from "react";

const HeroSection = () => {
  
  const [isAuthed, setIsAuthed] = useState(false);
  useEffect(() => { setIsAuthed(!!getToken()); }, []);
  return (
    <section className="bg-background text-foreground">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-center px-6 py-24 text-center">
        {/* Eyebrow / Produkt-Titel */}
        <div className="mb-3">
          <span
            className="inline-flex items-center rounded-full border px-4 py-1.5
                   text-sm md:text-base font-semibold tracking-wide
                   text-muted-foreground"
          >
            Bewerbungsmanager
          </span>
        </div>
        {/* Headline */}
        <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
          Manage your job applications with ease
        </h1>

        {/* Subheadline */}
        <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
          Bewerbungsmanager helps you organize applications, notes, and attachments all in one place
          — so you can stay focused on your career.
        </p>

        {/* Call-to-action buttons */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          {isAuthed ? (
            <>
              <Button asChild>
                <Link href="/dashboard" prefetch={false}>Go to Dashboard</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="#features">Explore features</Link>
              </Button>
            </>
          ) : (
            <>
              <Button asChild>
                <Link href="/register" prefetch={false}>Get Started</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/login" prefetch={false}>Log in</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
