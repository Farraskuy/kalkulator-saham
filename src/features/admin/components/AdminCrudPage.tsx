'use client';

import type React from 'react';

export interface AdminCrudPageProps {
  children: React.ReactNode;
}

export function AdminCrudPage({ children }: AdminCrudPageProps) {
  return <div className="mx-auto max-w-[1280px] space-y-5 pb-10">{children}</div>;
}
