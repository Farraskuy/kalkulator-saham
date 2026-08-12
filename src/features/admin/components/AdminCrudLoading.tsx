'use client';

export interface AdminCrudLoadingProps {
  label: string;
}

export function AdminCrudLoading({ label }: AdminCrudLoadingProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border-custom bg-card" role="status" aria-label={label}>
      <div className="border-b border-border-custom px-4 py-3.5">
        <div className="h-4 w-36 animate-pulse rounded bg-sub-slate" />
        <div className="mt-2 h-3 w-56 animate-pulse rounded bg-sub-slate" />
      </div>
      <div className="flex flex-col gap-3 border-b border-border-custom p-4 sm:flex-row sm:justify-between">
        <div className="h-10 w-full animate-pulse rounded-xl bg-sub-slate sm:w-80" />
        <div className="flex gap-2">
          <div className="h-10 w-32 animate-pulse rounded-xl bg-sub-slate" />
          <div className="h-10 w-28 animate-pulse rounded-xl bg-sub-slate" />
        </div>
      </div>
      <div className="overflow-hidden">
        <div className="grid grid-cols-4 gap-4 border-b border-border-custom bg-sub-slate/60 px-4 py-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-3 animate-pulse rounded bg-sub-slate" />
          ))}
        </div>
        {Array.from({ length: 6 }).map((_, row) => (
          <div key={row} className="grid grid-cols-4 gap-4 border-b border-border-custom px-4 py-4 last:border-0">
            {Array.from({ length: 4 }).map((_, column) => (
              <div
                key={column}
                className={`h-4 animate-pulse rounded bg-sub-slate ${
                  column === 0 ? 'w-4/5' : column === 3 ? 'w-2/3' : 'w-full'
                }`}
              />
            ))}
          </div>
        ))}
      </div>
      <span className="sr-only">{label}</span>
    </div>
  );
}
