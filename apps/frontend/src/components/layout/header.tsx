'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ModeToggle } from '@/components/ui/mode-toggle';
import{ shouldShowAuthLinks }from '@/lib/routes';

export default function Header() {
  const pathname = usePathname();
const showLinks = shouldShowAuthLinks(pathname);

  return (
    <header className="w-full border-b border-border bg-background text-foreground">
      <div className="mx-auto px-8 py-4 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold hover:opacity-90">
          Bewerbungsmanager
        </Link>

        <div className="flex items-center gap-4">
          {showLinks && (
            <>
              <Link
                href="/login"
                className="text-sm font-medium hover:underline"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
              >
                Register
              </Link>
            </>
          )}
          <ModeToggle />
        </div>
      </div>
    </header>
  );
}