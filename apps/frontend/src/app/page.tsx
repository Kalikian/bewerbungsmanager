import { ModeToggle } from "@/components/ui/mode-toggle";

export default function HomePage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background text-foreground">

      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Hello Bewerbungsmanager</h1>
        <p className="text-lg text-gray-600 mb-6">
          Manage your job applications professionally.
        </p>
      </div>
    </main>
  );
}