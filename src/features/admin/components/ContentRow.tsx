"use client";

import type { LucideIcon } from "lucide-react";

export interface ContentRowProps {
  label: string;
  value: number;
  icon: LucideIcon;
  tone: string;
}

export function ContentRow({
  label,
  value,
  icon: Icon,
  tone,
}: ContentRowProps) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-border-custom p-3">
      <div className="flex items-center gap-3">
        <span
          className={`flex h-8 w-8 items-center justify-center rounded-lg ${tone}`}
        >
          <Icon size={15} />
        </span>
        <span className="text-sm font-medium text-main">{label}</span>
      </div>
      <span className="text-sm font-bold text-main">{value}</span>
    </div>
  );
}

export default ContentRow;
