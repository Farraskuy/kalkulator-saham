"use client";

import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { Plus } from "lucide-react";
import { primaryButtonClass } from "./AdminCrudClasses";

export interface AdminCrudHeaderProps {
  title: string;
  description: string;
  actionHref?: string;
  actionLabel?: string;
  onActionClick?: () => void;
  icon?: LucideIcon;
}

export function AdminCrudHeader({
  title,
  description,
  actionHref,
  actionLabel,
  onActionClick,
  icon: Icon,
}: AdminCrudHeaderProps) {
  return (
    <div className="flex flex-col gap-4 border-b border-border-custom pb-5 mb-6 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <div className="flex items-center gap-2 text-xl font-bold tracking-tight text-main sm:text-2xl">
          {Icon && <Icon size={24} className="text-acc-blue" />}
          <h1>{title}</h1>
        </div>
        <p className="mt-1 text-sm leading-6 text-muted">{description}</p>
      </div>
      {actionHref && actionLabel ? (
        <Link href={actionHref} className={primaryButtonClass}>
          <Plus size={16} />
          <span>{actionLabel}</span>
        </Link>
      ) : onActionClick && actionLabel ? (
        <button
          type="button"
          onClick={onActionClick}
          className={primaryButtonClass}
        >
          <Plus size={16} />
          <span>{actionLabel}</span>
        </button>
      ) : null}
    </div>
  );
}
