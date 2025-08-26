import { Button } from "@/components/ui/button";

export default function CtaSection() {
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
          <Button size="lg" asChild>
            <a href="/register">Get Started</a>
          </Button>
        </div>
      </div>
    </section>
  );
}
