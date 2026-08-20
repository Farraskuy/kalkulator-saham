import React from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface BlogPaginationProps {
  currentPage: number;
  totalPages: number;
  hrefForPage: (page: number) => string;
}

export default function BlogPagination({
  currentPage,
  totalPages,
  hrefForPage,
}: BlogPaginationProps) {
  if (totalPages <= 1) return null;

  const visiblePages = new Set([
    1,
    totalPages,
    currentPage - 1,
    currentPage,
    currentPage + 1,
  ]);
  const pages = Array.from(visiblePages)
    .filter((page) => page >= 1 && page <= totalPages)
    .sort((a, b) => a - b);

  return (
    <nav
      className="mt-8 flex flex-wrap items-center justify-center gap-2"
      aria-label="Navigasi halaman artikel"
    >
      <Link
        href={hrefForPage(Math.max(1, currentPage - 1))}
        aria-disabled={currentPage === 1}
        className={`inline-flex h-10 items-center gap-1 rounded-lg border px-3 text-xs font-bold transition-colors ${
          currentPage === 1
            ? "pointer-events-none border-border-custom text-muted opacity-50"
            : "border-border-custom text-main hover:bg-sub-slate"
        }`}
      >
        <ChevronLeft size={15} /> Sebelumnya
      </Link>

      {pages.map((page, index) => (
        <React.Fragment key={page}>
          {index > 0 && page - pages[index - 1] > 1 && (
            <span className="px-1 text-sm text-muted">…</span>
          )}
          <Link
            href={hrefForPage(page)}
            aria-current={page === currentPage ? "page" : undefined}
            className={`grid h-10 min-w-10 place-items-center rounded-lg px-2 text-xs font-bold transition-colors ${
              page === currentPage
                ? "bg-slate-900 text-white dark:bg-white dark:text-slate-950"
                : "text-main hover:bg-sub-slate"
            }`}
          >
            {page}
          </Link>
        </React.Fragment>
      ))}

      <Link
        href={hrefForPage(Math.min(totalPages, currentPage + 1))}
        aria-disabled={currentPage === totalPages}
        className={`inline-flex h-10 items-center gap-1 rounded-lg border px-3 text-xs font-bold transition-colors ${
          currentPage === totalPages
            ? "pointer-events-none border-border-custom text-muted opacity-50"
            : "border-border-custom text-main hover:bg-sub-slate"
        }`}
      >
        Berikutnya <ChevronRight size={15} />
      </Link>
    </nav>
  );
}
