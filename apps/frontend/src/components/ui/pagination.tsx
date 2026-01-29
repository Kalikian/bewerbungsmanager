import * as React from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

function getPageRange(current: number, total: number) {
  // English comments:
  // Always show first/last, and a small window around current page.
  const window = 2;
  const pages = new Set<number>();

  pages.add(1);
  pages.add(total);

  for (let p = current - window; p <= current + window; p++) {
    if (p >= 1 && p <= total) pages.add(p);
  }

  const sorted = Array.from(pages).sort((a, b) => a - b);

  // Insert ellipses markers as 0
  const result: number[] = [];
  for (let i = 0; i < sorted.length; i++) {
    result.push(sorted[i]);
    if (i < sorted.length - 1 && sorted[i + 1] - sorted[i] > 1) {
      result.push(0);
    }
  }
  return result;
}

/* shadcn-like primitives (kept inline for consistency and reuse) */
function PaginationRoot(props: React.ComponentProps<"nav">) {
  return <nav aria-label="Pagination" {...props} />;
}

function PaginationContent(props: React.ComponentProps<"ul">) {
  return <ul className={cn("flex flex-row items-center gap-1", props.className)} {...props} />;
}

function PaginationItem(props: React.ComponentProps<"li">) {
  return <li {...props} />;
}

function PaginationLink({
  isActive,
  className,
  ...props
}: React.ComponentProps<typeof Link> & { isActive?: boolean }) {
  return (
    <Link
      aria-current={isActive ? "page" : undefined}
      className={cn(
        buttonVariants({ variant: isActive ? "default" : "outline", size: "icon" }),
        "h-9 w-9",
        className,
      )}
      {...props}
    />
  );
}

function PaginationEllipsis() {
  return (
    <span
      aria-hidden="true"
      className={cn(
        buttonVariants({ variant: "ghost", size: "icon" }),
        "h-9 w-9 pointer-events-none opacity-60",
      )}
    >
      <MoreHorizontal className="h-4 w-4" />
    </span>
  );
}

function PaginationPrevious({ href, disabled }: { href: string; disabled?: boolean }) {
  return (
    <Link
      aria-disabled={disabled}
      className={cn(
        buttonVariants({ variant: "outline", size: "icon" }),
        "h-9 w-9",
        disabled && "pointer-events-none opacity-50",
      )}
      href={href}
      title="Previous page"
    >
      <ChevronLeft className="h-4 w-4" />
      <span className="sr-only">Previous</span>
    </Link>
  );
}

function PaginationNext({ href, disabled }: { href: string; disabled?: boolean }) {
  return (
    <Link
      aria-disabled={disabled}
      className={cn(
        buttonVariants({ variant: "outline", size: "icon" }),
        "h-9 w-9",
        disabled && "pointer-events-none opacity-50",
      )}
      href={href}
      title="Next page"
    >
      <ChevronRight className="h-4 w-4" />
      <span className="sr-only">Next</span>
    </Link>
  );
}

/* Default export = your app-level pagination controller */
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

  const safePage = Math.min(Math.max(1, currentPage), totalPages);
  const range = getPageRange(safePage, totalPages);

  return (
    <PaginationRoot>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            disabled={safePage === 1}
            href={makeHref(Math.max(1, safePage - 1))}
          />
        </PaginationItem>

        {range.map((p, idx) => (
          <PaginationItem key={p === 0 ? `e-${idx}` : p}>
            {p === 0 ? (
              <PaginationEllipsis />
            ) : (
              <PaginationLink href={makeHref(p)} isActive={p === safePage}>
                {p}
              </PaginationLink>
            )}
          </PaginationItem>
        ))}

        <PaginationItem>
          <PaginationNext
            disabled={safePage === totalPages}
            href={makeHref(Math.min(totalPages, safePage + 1))}
          />
        </PaginationItem>
      </PaginationContent>
    </PaginationRoot>
  );
}
