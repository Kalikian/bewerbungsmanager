import { ModeToggle } from "@/components/mode-toggle";

export default function HomePage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background text-foreground">
      <header className="absolute top-4 right-4"><ModeToggle /></header>
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Hello Bewerbungsmanager</h1>
        <p className="text-lg text-gray-600 mb-6">
          Manage your job applications easily and professionally.
        </p>
      </div>
    </main>
  );
}