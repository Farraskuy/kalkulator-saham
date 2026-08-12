'use client';

export interface AdminEditorSkeletonProps {
  label?: string;
}

export function AdminEditorSkeleton({ label = 'Memuat data...' }: AdminEditorSkeletonProps) {
  return (
    <div className="mx-auto max-w-5xl space-y-5 pb-10" role="status" aria-label={label}>
      <div className="flex items-center justify-between border-b border-border-custom pb-5">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 animate-pulse rounded-xl bg-sub-slate" />
          <div>
            <div className="h-3 w-24 animate-pulse rounded bg-sub-slate" />
            <div className="mt-2 h-6 w-48 animate-pulse rounded bg-sub-slate" />
            <div className="mt-2 h-3 w-64 animate-pulse rounded bg-sub-slate" />
          </div>
        </div>
        <div className="h-10 w-36 animate-pulse rounded-xl bg-sub-slate" />
      </div>
      <div className="space-y-5 rounded-2xl border border-border-custom bg-card p-6">
        <div className="h-4 w-28 animate-pulse rounded bg-sub-slate" />
        <div className="h-10 w-full animate-pulse rounded-xl bg-sub-slate" />
        <div className="h-4 w-24 animate-pulse rounded bg-sub-slate" />
        <div className="h-10 w-full animate-pulse rounded-xl bg-sub-slate" />
        <div className="h-4 w-20 animate-pulse rounded bg-sub-slate" />
        <div className="h-36 w-full animate-pulse rounded-xl bg-sub-slate" />
      </div>
      <span className="sr-only">{label}</span>
    </div>
  );
}
