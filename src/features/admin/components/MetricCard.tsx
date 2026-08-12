'use client';

import type { LucideIcon } from 'lucide-react';
import { formatNumber } from '@/lib/utils/formatters';

export interface MetricCardProps {
  label: string;
  value: number;
  helper: string;
  icon: LucideIcon;
  tone: 'blue' | 'green' | 'amber' | 'violet';
}

export function MetricCard({ label, value, helper, icon: Icon, tone }: MetricCardProps) {
  const tones = {
    blue: 'bg-sub-blue text-acc-blue',
    green: 'bg-emerald-500/10 text-emerald-600',
    amber: 'bg-amber-500/10 text-amber-600',
    violet: 'bg-violet-500/10 text-violet-600',
  };
  return (
    <div className="rounded-2xl border border-border-custom bg-card p-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-muted">{label}</p>
          <p className="mt-2 text-2xl font-bold tracking-tight text-main">{formatNumber(value)}</p>
          <p className="mt-1 text-[11px] text-muted">{helper}</p>
        </div>
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${tones[tone]}`}>
          <Icon size={18} />
        </div>
      </div>
    </div>
  );
}

export default MetricCard;
