import React from "react";
import { Button } from "@/components/ui/button";

const HeroSection = () => {
  return (
    <section className="bg-background text-foreground">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-center px-6 py-24 text-center">
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
        <div className="mt-8 flex gap-4">
          <Button asChild>
            <a href="/register">Get Started</a>
          </Button>
          <Button variant="outline" asChild>
            <a href="#features">Learn More</a>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
