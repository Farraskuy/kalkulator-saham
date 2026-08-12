'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { Check, XCircle, AlertTriangle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastItem {
  id: string;
  type: ToastType;
  message: React.ReactNode;
}

interface ToastContextType {
  showToast: (message: React.ReactNode, type?: ToastType, duration?: number) => void;
  success: (message: React.ReactNode, duration?: number) => void;
  error: (message: React.ReactNode, duration?: number) => void;
  warning: (message: React.ReactNode, duration?: number) => void;
  info: (message: React.ReactNode, duration?: number) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (message: React.ReactNode, type: ToastType = 'success', duration = 3500) => {
      const id = Date.now() + Math.random().toString(36).substring(2, 9);
      setToasts((prev) => [...prev, { id, type, message }]);

      setTimeout(() => {
        removeToast(id);
      }, duration);
    },
    [removeToast]
  );

  const success = useCallback(
    (message: React.ReactNode, duration?: number) => showToast(message, 'success', duration),
    [showToast]
  );
  const error = useCallback(
    (message: React.ReactNode, duration?: number) => showToast(message, 'error', duration),
    [showToast]
  );
  const warning = useCallback(
    (message: React.ReactNode, duration?: number) => showToast(message, 'warning', duration),
    [showToast]
  );
  const info = useCallback(
    (message: React.ReactNode, duration?: number) => showToast(message, 'info', duration),
    [showToast]
  );

  return (
    <ToastContext.Provider value={{ showToast, success, error, warning, info, removeToast }}>
      {children}
      {/* Global Premium Toasts Container (Kanan Atas, Rounded - Replicated from credisuite-server) */}
      <div
        className="fixed top-5 right-5 z-[9999] space-y-3 max-w-sm w-full pointer-events-none px-4 sm:px-0"
        aria-live="polite"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="pointer-events-auto bg-card border border-border-custom rounded-lg shadow-[0_8px_30px_rgb(0,0,0,0.08)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.4)] p-4 flex items-start gap-3 w-full select-none text-main animate-toast-slide-in"
          >
            {/* Icon based on type */}
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 border ${
                toast.type === 'success'
                  ? 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900/50'
                  : toast.type === 'error'
                  ? 'bg-rose-50 text-rose-600 border-rose-100 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-900/50'
                  : toast.type === 'warning'
                  ? 'bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900/50'
                  : 'bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-900/50'
              }`}
            >
              {toast.type === 'success' && <Check className="w-4 h-4" />}
              {toast.type === 'error' && <XCircle className="w-4 h-4" />}
              {toast.type === 'warning' && <AlertTriangle className="w-4 h-4" />}
              {toast.type === 'info' && <Info className="w-4 h-4" />}
            </div>

            <div className="flex-1 pt-0.5 min-w-0">
              <p className="text-[11px] font-bold text-main leading-snug break-words">{toast.message}</p>
            </div>

            <button
              type="button"
              onClick={() => removeToast(toast.id)}
              className="text-muted hover:text-main cursor-pointer shrink-0 p-0.5"
              aria-label="Tutup notifikasi"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    const fallback = (message: React.ReactNode) => console.log(message);
    return {
      showToast: fallback,
      success: fallback,
      error: fallback,
      warning: fallback,
      info: fallback,
      removeToast: () => {},
    };
  }
  return context;
}
