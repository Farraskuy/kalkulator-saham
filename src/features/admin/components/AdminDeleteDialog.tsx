"use client";

import { LoaderCircle, Trash2 } from "lucide-react";
import { secondaryButtonClass } from "./AdminCrudClasses";

export interface AdminDeleteDialogProps {
  title: string;
  description: string;
  busy: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export function AdminDeleteDialog({
  title,
  description,
  busy,
  onCancel,
  onConfirm,
}: AdminDeleteDialogProps) {
  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 p-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-md rounded-2xl border border-border-custom bg-card p-5">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-rose-500/10 text-rose-600">
          <Trash2 size={20} />
        </div>
        <h2 className="mt-4 text-lg font-bold text-main">{title}</h2>
        <p className="mt-2 text-sm leading-6 text-muted">{description}</p>
        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            disabled={busy}
            onClick={onCancel}
            className={secondaryButtonClass}
          >
            Batal
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={onConfirm}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-rose-600 px-4 text-sm font-semibold text-white disabled:opacity-60"
          >
            {busy && <LoaderCircle size={16} className="animate-spin" />}
            Hapus permanen
          </button>
        </div>
      </div>
    </div>
  );
}
