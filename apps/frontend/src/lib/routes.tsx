// src/lib/routes.ts
// Defines on which pages which navigation links should be shown
export const AUTH_PAGES = new Set<string>(["/login", "/register"]);

// Public area where login/register should be shown
export const PUBLIC_EXACT = new Set<string>(["/"]); // Landing
export const PUBLIC_PREFIXES: string[] = ["/marketing"];

// Dashboard area where logout should be shown
export const DASHBOARD_PREFIXES: string[] = ["/profile", "/applications", "/dashboard"];

/* -------------------------------------------------------------- */

function matchesAnyPrefix(pathname: string, prefixes: string[]) {
  return prefixes.some((p) => pathname.startsWith(p));
}

export function isAuthPage(pathname: string | null): boolean {
  if (!pathname) return false;
  return AUTH_PAGES.has(pathname);
}

export function isPublicArea(pathname: string | null): boolean {
  if (!pathname) return false;
  if (PUBLIC_EXACT.has(pathname)) return true;
  return matchesAnyPrefix(pathname, PUBLIC_PREFIXES);
}

export function isDashboardArea(pathname: string | null): boolean {
  if (!pathname) return false;
  return matchesAnyPrefix(pathname, DASHBOARD_PREFIXES);
}

// Provides a compact view for the header
// Show login/register? (only in the public area if no token is present)
// Show logout? (only in the dashboard area if a token is present)
// We do not display either on auth pages (login/register)
export function navStateFor(pathname: string | null, hasToken: boolean) {
  const onAuth = isAuthPage(pathname);
  const inPublic = isPublicArea(pathname);
  const inDash = isDashboardArea(pathname);

  return {
    showLoginRegister: !hasToken && !onAuth && inPublic,
    showLogout: hasToken && !onAuth && inDash,
  };
}
