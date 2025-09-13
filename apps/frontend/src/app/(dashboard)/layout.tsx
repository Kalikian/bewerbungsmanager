// src/app/(dashboard)/layout.tsx
"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AuthProvider } from "@/context/authProvider";

/** Local JWT exp check. Returns true if token is missing or expired. */
function isJwtExpired(token: string | null, skewSec = 5): boolean {
  if (!token) return true;
  try {
    const part = token.split(".")[1];
    if (!part) return true;
    const json = atob(part.replace(/-/g, "+").replace(/_/g, "/"));
    const payload = JSON.parse(json);
    const expMs = typeof payload?.exp === "number" ? payload.exp * 1000 : 0;
    if (!expMs) return true;
    return Date.now() >= expMs - skewSec * 1000;
  } catch {
    return true;
  }
}

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const kick = () => {
      try { localStorage.removeItem("token"); } catch {}
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    };
    const check = () => {
      const t = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (isJwtExpired(t)) kick();
    };

    check();
    const onFocus = () => check();
    const onVisible = () => { if (!document.hidden) check(); };
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [pathname, router]);

  useEffect(() => {
  if (typeof window === "undefined") return;
  if ((window as any).__bmFetchPatched) return;
  (window as any).__bmFetchPatched = true;

  const API_BASE =
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    "";

  const kick = () => {
    try { localStorage.removeItem("token"); } catch {}
    const next = encodeURIComponent(window.location.pathname + window.location.search);
    window.location.replace(`/login?next=${next}`);
  };

  const isJwtExpired = (token: string | null, skewSec = 5) => {
    if (!token) return true;
    try {
      const part = token.split(".")[1]; if (!part) return true;
      const json = atob(part.replace(/-/g, "+").replace(/_/g, "/"));
      const payload = JSON.parse(json);
      const expMs = typeof payload?.exp === "number" ? payload.exp * 1000 : 0;
      return !expMs || Date.now() >= expMs - skewSec * 1000;
    } catch { return true; }
  };

  const orig = window.fetch.bind(window);
  window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const res = await orig(input, init);

    const url = typeof input === "string" ? input : input.toString();
    const isApi = API_BASE ? url.startsWith(API_BASE) : /^https?:/i.test(url);
    if (!isApi) return res;

    if (res.status === 401 || res.status === 403) {
      kick();
      return res;
    }

    const token = localStorage.getItem("token");
    if (isJwtExpired(token)) {
      setTimeout(kick, 800); 
    }

    return res;
  };

  console.debug("[auth-guard] fetch interceptor enabled (graceful logout)");
}, []);

  return (
    <AuthProvider>
      <main>{children}</main>
    </AuthProvider>
  );
}
