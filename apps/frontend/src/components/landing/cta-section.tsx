"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { getToken } from "@/lib/http";

export default function CtaSection() {
  const [Isauthed, setIsAuthed] = useState(false);

  useEffect(() => {
    const update = () => setIsAuthed(!!getToken());
    update();
    window.addEventListener("auth:changed", update);
    return () => window.removeEventListener("auth:changed", update);
  }, []);

  return (
    <section className="bg-accent text-accent-foreground py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8 text-center">
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Ready to take control of your job hunt?
        </h2>
        <p className="mt-6 text-lg max-w-2xl mx-auto">
          Start organizing your job applications today and stay on top of every opportunity.
        </p>
        <div className="mt-8 flex justify-center">
          {Isauthed ? (
            <Button size="lg" asChild>
              <Link href="/applications" prefetch={false}>
                Go to Applications
              </Link>
            </Button>
          ) : (
            <Button size="lg" asChild>
              <Link href="/register" prefetch={false}>
                Get Started
              </Link>
            </Button>
          )}
        </div>
      </div>
    </section>
  );
}
