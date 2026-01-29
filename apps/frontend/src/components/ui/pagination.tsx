import Link from "next/link";

function getPageRange(current: number, total: number) {
  // Always show first/last, and a window around current page.
  const window = 2; // pages on each side
  const pages = new Set<number>();

  pages.add(1);
  pages.add(total);

  for (let p = current - window; p <= current + window; p++) {
    if (p >= 1 && p <= total) pages.add(p);
  }

  const sorted = Array.from(pages).sort((a, b) => a - b);

  // Insert ellipses markers as 0
  const result: Array<number> = [];
  for (let i = 0; i < sorted.length; i++) {
    result.push(sorted[i]);
    if (i < sorted.length - 1 && sorted[i + 1] - sorted[i] > 1) {
      result.push(0); // ellipsis
    }
  }
  return result;
}

export default function Pagination({
  currentPage,
  totalPages,
  makeHref,
}: {
  currentPage: number;
  totalPages: number;
  makeHref: (page: number) => string;
}) {
  if (totalPages <= 1) return null;

  const range = getPageRange(currentPage, totalPages);

  return (
    <nav aria-label="Pagination" className="flex items-center gap-2 flex-wrap">
      <Link
        aria-disabled={currentPage === 1}
        className={`px-3 py-1 border rounded ${currentPage === 1 ? "pointer-events-none opacity-50" : ""}`}
        href={makeHref(Math.max(1, currentPage - 1))}
      >
        Prev
      </Link>

      {range.map((p, idx) =>
        p === 0 ? (
          <span key={`e-${idx}`} className="px-2 text-muted-foreground">
            …
          </span>
        ) : (
          <Link
            key={p}
            className={`px-3 py-1 border rounded ${p === currentPage ? "font-semibold" : ""}`}
            href={makeHref(p)}
          >
            {p}
          </Link>
        ),
      )}

      <Link
        aria-disabled={currentPage === totalPages}
        className={`px-3 py-1 border rounded ${
          currentPage === totalPages ? "pointer-events-none opacity-50" : ""
        }`}
        href={makeHref(Math.min(totalPages, currentPage + 1))}
      >
        Next
      </Link>
    </nav>
  );
}
