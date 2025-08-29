//components/layout/header.tsx
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { Button } from "@/components/ui/button";
import { getToken, clearToken } from "@/lib/http";
import { navStateFor } from "@/lib/routes";
import { useEffect, useState } from "react";
import { UserDropdown } from "../ui/user-icon";

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [isAuthed, setIsAuthed] = useState(false);

  useEffect(() => {
    setIsAuthed(!!getToken());
  }, [pathname]);

  const { showLoginRegister, showLogout } = navStateFor(pathname, isAuthed);

  return (
    <header className="w-full border-b border-border bg-background text-foreground">
      <div className="mx-auto px-2 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button asChild size="sm" variant="ghost">
            <Link href="/" prefetch={false}>
              Home
            </Link>
          </Button>
          <Button asChild size="sm" variant="ghost">
            <Link href="/applications" prefetch={false}>
              Applications
            </Link>
          </Button>
        </div>
        <div className="flex items-center gap-3">
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
          {showLogout && <UserDropdown />}
          <ModeToggle />
        </div>
      </div>
    </header>
  );
}
