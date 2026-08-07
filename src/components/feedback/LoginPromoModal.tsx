'use client';

import React from 'react';
import { X, CheckCircle2 } from 'lucide-react';
import AppLogo from '@/components/layout/AppLogo';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function LoginPromoModal({ isOpen, onClose }: Props) {
  if (!isOpen) return null;

  const handleGoogleLogin = () => {
    window.location.href = '/api/auth/google';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-card w-full max-w-md rounded-3xl border border-border-custom/60 shadow-2xl overflow-hidden relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-muted hover:bg-sub-slate hover:text-main transition-colors cursor-pointer"
        >
          <X size={18} />
        </button>

        <div className="p-6 sm:p-8 space-y-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-sub-blue text-acc-blue flex items-center justify-center mx-auto shadow-lg shadow-acc-blue/10">
            <AppLogo size={40} />
          </div>

          <div className="space-y-2">
            <h3 className="text-xl sm:text-2xl font-extrabold text-main">
              Simpan Histori Perhitungan Kamu secara Otomatis!
            </h3>
            <p className="text-xs sm:text-sm text-muted leading-relaxed">
              Masuk dengan akun Google untuk membuka fitur penyimpanan riwayat kalkulasi ARA/ARB, Average Down, dan Target Profit tanpa batas.
            </p>
          </div>

          <div className="bg-sub-slate/60 p-4 rounded-2xl space-y-2 text-left text-xs font-medium text-main">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-acc-blue shrink-0" />
              <span>Simpan hasil simulasi transaksi saham</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-acc-blue shrink-0" />
              <span>Akses histori perhitungan dari mana saja</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-acc-blue shrink-0" />
              <span>100% Gratis dan Cepat</span>
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={handleGoogleLogin}
              className="w-full flex items-center justify-center gap-3 bg-slate-900 hover:bg-black dark:bg-white dark:hover:bg-slate-100 dark:text-black text-white font-extrabold py-3.5 px-4 rounded-xl text-sm transition-all shadow-md cursor-pointer"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Lanjutkan dengan Google</span>
            </button>

            <button
              onClick={onClose}
              className="text-xs font-bold text-muted hover:text-main cursor-pointer"
            >
              Nanti Saja
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
