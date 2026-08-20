"use client";

import type { ArticleData } from "@/types";

export function StatusBadge({ status }: { status: ArticleData["status"] }) {
  const published = status === "PUBLISHED";
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${
        published
          ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
          : "bg-amber-500/10 text-amber-700 dark:text-amber-400"
      }`}
    >
      {published ? "Published" : "Draft"}
    </span>
  );
}

export default StatusBadge;
