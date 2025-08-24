export default function Footer() {
  return (
    <footer className="w-full border-b border-border bg-background text-foreground">
      <div className="mx-auto flex flex-col items-center justify-between px-8 py-8 sm:flex-row">
        {/* Left side: Project name + year */}
        <p className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} Bewerbungsmanager. All rights reserved.
        </p>

        {/* Right side: Links */}
        <div className="flex gap-6 text-sm">
          <a
            href="https://github.com/Kalikian" 
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-foreground"
          >
            GitHub
          </a>
          <a href="/privacy" className="text-muted-foreground hover:text-foreground">
            Privacy
          </a>
          <a href="/imprint" className="text-muted-foreground hover:text-foreground">
            Imprint
          </a>
        </div>
      </div>
    </footer>
  )
}
