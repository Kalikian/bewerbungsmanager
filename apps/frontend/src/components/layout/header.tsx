"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { getToken, clearToken } from "@/lib/http";
import { navStateFor } from "@/lib/routes";

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const hasToken = !!getToken();
  const { showLoginRegister, showLogout } = navStateFor(pathname, hasToken);

  function onLogout() {
    clearToken();
    router.push("/login");
  }

  return (
    <header className="w-full border-b border-border bg-background text-foreground">
      <div className="mx-auto px-8 py-4 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold hover:opacity-90">
          Bewerbungsmanager
        </Link>

        <div className="flex items-center gap-4">
          {showLoginRegister && (
            <>
              <Link href="/login" className="text-sm font-medium hover:underline">
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

          {showLogout && (
            <button
              onClick={onLogout}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
              aria-label="Logout"
            >
              Logout
            </button>
          )}

          <ModeToggle />
        </div>
      </div>
    </header>
  );
}
