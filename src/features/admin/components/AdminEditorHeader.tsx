"use client";

import Link from "next/link";
import { ArrowLeft, LoaderCircle, Save } from "lucide-react";
import { primaryButtonClass } from "./AdminCrudClasses";

export interface AdminEditorHeaderProps {
  backHref: string;
  eyebrow: string;
  title: string;
  description: string;
  actionLabel: string;
  submitting: boolean;
  disabled?: boolean;
}

export function AdminEditorHeader({
  backHref,
  eyebrow,
  title,
  description,
  actionLabel,
  submitting,
  disabled = false,
}: AdminEditorHeaderProps) {
  return (
    <header className="flex flex-col gap-4 border-b border-border-custom pb-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3">
        <Link
          href={backHref}
          className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border-custom bg-card text-muted transition-colors hover:text-acc-blue"
          aria-label="Kembali"
        >
          <ArrowLeft size={17} />
        </Link>
        <div>
          <p className="text-xs font-semibold text-acc-blue">{eyebrow}</p>
          <h1 className="mt-0.5 text-xl font-bold tracking-tight text-main sm:text-2xl">
            {title}
          </h1>
          <p className="mt-1 text-sm leading-6 text-muted">{description}</p>
        </div>
      </div>
      <button
        type="submit"
        disabled={submitting || disabled}
        className={primaryButtonClass}
      >
        {submitting ? (
          <LoaderCircle size={16} className="animate-spin" />
        ) : (
          <Save size={16} />
        )}
        {submitting ? "Menyimpan..." : actionLabel}
      </button>
    </header>
  );
}
