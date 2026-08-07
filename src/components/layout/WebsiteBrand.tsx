'use client';

import React from 'react';
import AppLogo from './AppLogo';

interface WebsiteBrandProps {
  size?: number;
  className?: string;
  showText?: boolean;
}

export default function WebsiteBrand({
  size = 28,
  className = '',
  showText = true,
}: WebsiteBrandProps) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <AppLogo size={size} />
      {showText && (
        <span className="font-extrabold text-lg text-main tracking-tight">
          HitungSaham
        </span>
      )}
    </div>
  );
}
