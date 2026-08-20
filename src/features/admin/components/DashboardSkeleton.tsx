"use client";

export function DashboardPanelSkeleton({ rows }: { rows: number }) {
  return (
    <section className="overflow-hidden rounded-2xl border border-border-custom bg-card">
      <div className="border-b border-border-custom px-5 py-4">
        <div className="h-4 w-32 rounded bg-sub-slate" />
        <div className="mt-2 h-3 w-48 rounded bg-sub-slate" />
      </div>
      <div className="space-y-4 p-5">
        {Array.from({ length: rows }, (_, index) => (
          <div key={index} className="flex items-center justify-between">
            <div className="h-4 w-2/5 rounded bg-sub-slate" />
            <div className="h-4 w-16 rounded bg-sub-slate" />
          </div>
        ))}
      </div>
    </section>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="animate-pulse space-y-5" aria-label="Memuat dashboard">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <div
            key={index}
            className="h-28 rounded-2xl border border-border-custom bg-card p-4"
          >
            <div className="h-3 w-24 rounded bg-sub-slate" />
            <div className="mt-4 h-7 w-20 rounded bg-sub-slate" />
            <div className="mt-3 h-3 w-28 rounded bg-sub-slate" />
          </div>
        ))}
      </div>
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
        <DashboardPanelSkeleton rows={4} />
        <DashboardPanelSkeleton rows={3} />
      </div>
      <DashboardPanelSkeleton rows={3} />
    </div>
  );
}

export default DashboardSkeleton;
