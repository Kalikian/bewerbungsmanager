import { ModeToggle } from "@/components/ui/mode-toggle"; 

export default function Header() {
  return (
    <header className="w-full border-b border-border bg-background text-foreground">
      <div className="mx-auto flex max-w-full items-center justify-between px-8 py-4">
        {/* Left: Project name */}
        <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
          Bewerbungsmanager
        </h1>

        {/* Right: Nav links + Toggle */}
        <nav className="flex items-center gap-4">
          <a
            href="/login"
            className="text-sm font-medium text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
          >
            Login
          </a>
          <a
            href="/register"
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
          >
            Register
          </a>

          {/* Dark/Light toggle */}
          <ModeToggle />
        </nav>
      </div>
    </header>
  );
}
