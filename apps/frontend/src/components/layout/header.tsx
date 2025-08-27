"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { Button } from "@/components/ui/button";
import { getToken, clearToken } from "@/lib/http";
import { navStateFor } from "@/lib/routes";
import { useEffect, useState } from "react";

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [isAuthed, setIsAuthed] = useState(false);

  useEffect(() => {
    setIsAuthed(!!getToken());
  }, [pathname]);

  const { showLoginRegister, showLogout } = navStateFor(pathname, isAuthed);

  function onLogout() {
    clearToken();
    setIsAuthed(false);
    router.push("/login");
  }

  return (
    <header className="w-full border-b border-border bg-background text-foreground">
      <div className="mx-auto px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button asChild size="sm" variant="ghost">
            <Link href="/" prefetch={false}>
              Home
            </Link>
          </Button>
          <Button asChild size="sm" variant="ghost">
            <Link href="/dashboard" prefetch={false}>
              Dashboard
            </Link>
          </Button>
        </div>
        <div className="flex items-center gap-2">
          {showLoginRegister && (
            <>
              <Button asChild size="sm" variant="ghost">
                <Link href="/login" prefetch={false}>
                  Login
                </Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/register" prefetch={false}>
                  Register
                </Link>
              </Button>
            </>
          )}

          {showLogout && (
            <Button onClick={onLogout} size="sm" variant="ghost" aria-label="Logout">
              Logout
            </Button>
          )}

          <ModeToggle />
        </div>
      </div>
    </header>
  );
}
