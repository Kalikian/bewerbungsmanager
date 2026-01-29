import Link from "next/link";

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

  return (
    <nav aria-label="Pagination" className="flex items-center gap-2">
      <Link
        aria-disabled={currentPage === 1}
        className={`px-3 py-1 border rounded ${currentPage === 1 ? "pointer-events-none opacity-50" : ""}`}
        href={makeHref(Math.max(1, currentPage - 1))}
      >
        Prev
      </Link>

      {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
        <Link
          key={p}
          className={`px-3 py-1 border rounded ${p === currentPage ? "font-semibold" : ""}`}
          href={makeHref(p)}
        >
          {p}
        </Link>
      ))}

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
