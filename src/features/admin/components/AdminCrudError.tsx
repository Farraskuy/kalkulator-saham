"use client";

import { secondaryButtonClass } from "./AdminCrudClasses";

export interface AdminCrudErrorProps {
  message: string;
  onRetry: () => void;
}

export function AdminCrudError({ message, onRetry }: AdminCrudErrorProps) {
  return (
    <div className="flex min-h-64 flex-col items-center justify-center rounded-2xl border border-border-custom bg-card px-6 text-center">
      <p className="text-sm font-semibold text-rose-600">{message}</p>
      <button
        type="button"
        onClick={onRetry}
        className={`${secondaryButtonClass} mt-4`}
      >
        Coba lagi
      </button>
    </div>
  );
}
