"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { getToken } from "@/lib/http";
import { useEffect, useState } from "react";
import { Video } from "lucide-react";

const HeroSection = () => {
  const [isAuthed, setIsAuthed] = useState(false);

  useEffect(() => {
    const update = () => setIsAuthed(!!getToken());
    update();
    window.addEventListener("auth:changed", update);
    return () => window.removeEventListener("auth:changed", update);
  }, []);

  return (
    <section className="bg-background text-foreground">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-center px-6 py-24 text-center">
        {/* Eyebrow */}
        <div className="mb-3">
          <span
            className="inline-flex items-center rounded-full border px-4 py-1.5
            text-sm md:text-base font-semibold tracking-wide text-muted-foreground"
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
          Bewerbungsmanager helps you organize applications, notes, and attachments — so you can
          stay focused on your career.
        </p>

        {/* CTA Buttons */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          {isAuthed ? (
            <>
              <Button asChild>
                <Link href="/applications" prefetch={false}>
                  Go to Applications
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="#features">Explore features</Link>
              </Button>
            </>
          ) : (
            <>
              <Button asChild>
                <Link href="/register" prefetch={false}>
                  Get Started
                </Link>
              </Button>

              <Button variant="outline" asChild>
                <Link href="/login" prefetch={false}>
                  Log in
                </Link>
              </Button>

              {/* Demo Video CTA */}
              <Button variant="ghost" asChild>
                <a
                  href="https://www.youtube.com/watch?v=zzHbA31GbZU"
                  title="Opens a YouTube video in a new tab"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2"
                >
                  <Video className="h-5 w-5" />
                  Watch Demo (YouTube)
                </a>
              </Button>
            </>
          )}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
