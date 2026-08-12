'use client';

import React from 'react';

export interface ToggleSwitchProps {
  checked?: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  size?: 'sm' | 'md';
  title?: string;
  className?: string;
}

export default function ToggleSwitch({
  checked = false,
  onChange,
  disabled = false,
  size = 'md',
  title,
  className = '',
}: ToggleSwitchProps) {
  const isSm = size === 'sm';
  const trackSize = isSm ? 'h-5 w-9' : 'h-6 w-11';
  const knobSize = isSm ? 'h-4 w-4' : 'h-5 w-5';
  const translate = isSm ? 'translate-x-4' : 'translate-x-5';

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      title={title}
      onClick={() => !disabled && onChange(!checked)}
      className={`relative inline-flex ${trackSize} shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-acc-blue focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
        checked ? 'bg-acc-blue' : 'bg-sub-slate border-border-custom'
      } ${className}`}
    >
      <span
        aria-hidden="true"
        className={`pointer-events-none inline-block ${knobSize} transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
          checked ? translate : 'translate-x-0'
        }`}
      />
    </button>
  );
}
