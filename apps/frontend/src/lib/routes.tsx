// Define where to show auth links (login/register)
export const SHOW_LINKS_ON = new Set<string>(["/"]);
const SHOW_LINKS_PREFIXES = ["/marketing"];

export function shouldShowAuthLinks(pathname: string | null): boolean {
  if (!pathname) return false;
  if (SHOW_LINKS_ON.has(pathname)) return true;
  return SHOW_LINKS_PREFIXES.some((p) => pathname.startsWith(p));
}
