'use client';

import React, { useState } from 'react';
import { X, CheckCircle2 } from 'lucide-react';
import AppLogo from '@/components/layout/AppLogo';

interface LandingTwoLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LandingTwoLoginModal({ isOpen, onClose }: LandingTwoLoginModalProps) {
  const [dontShowAgain, setDontShowAgain] = useState(false);

  if (!isOpen) return null;

  const handleClose = () => {
    if (dontShowAgain) {
      localStorage.setItem('hide_google_login_promo_l2', 'true');
    }
    onClose();
  };

  const handleGoogleLogin = () => {
    if (dontShowAgain) {
      localStorage.setItem('hide_google_login_promo_l2', 'true');
    }
    window.location.href = '/api/auth/google/login';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200">
      <div className="bg-[#f7f7f5] text-[#111210] w-full max-w-md rounded-2xl border border-black/15 shadow-2xl overflow-hidden flex flex-col relative">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-1.5 rounded-full bg-black/5 text-[#52534e] hover:text-[#111210] hover:bg-black/10 transition-colors cursor-pointer z-10"
          aria-label="Tutup popup"
        >
          <X size={18} />
        </button>

        {/* Modal Header */}
        <div className="p-6 sm:p-7 pb-4 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-[#111210] text-white flex items-center justify-center mx-auto shadow-md">
            <AppLogo size={32} variant="white-icon" />
          </div>
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-[#111210] tracking-tight">
              Masuk dengan Google
            </h3>
            <p className="text-xs text-[#52534e] mt-1 leading-relaxed">
              Nikmati akses mudah menyimpan histori perhitungan dan proyeksi saham Anda.
            </p>
          </div>
        </div>

        {/* Benefits List */}
        <div className="px-6 sm:px-7 space-y-3 mb-5">
          <div className="bg-[#ebebeb] p-4 rounded-xl space-y-3 text-xs">
            <div className="flex items-start gap-2.5">
              <CheckCircle2 size={16} className="text-emerald-700 shrink-0 mt-0.5" />
              <div>
                <strong className="text-[#111210] block font-bold">Simpan Riwayat Perhitungan Otomatis</strong>
                <span className="text-[#52534e] text-[11px] leading-relaxed block">
                  Hasil simulasi target profit, ARA/ARB, dan average down tersimpan aman di akun Anda.
                </span>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <CheckCircle2 size={16} className="text-emerald-700 shrink-0 mt-0.5" />
              <div>
                <strong className="text-[#111210] block font-bold">Akses Kapan Saja &amp; Gratis 100%</strong>
                <span className="text-[#52534e] text-[11px] leading-relaxed block">
                  Buka kembali analisis portofolio dari HP maupun Laptop secara instan tanpa biaya.
                </span>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <CheckCircle2 size={16} className="text-emerald-700 shrink-0 mt-0.5" />
              <div>
                <strong className="text-[#111210] block font-bold">Autentikasi Aman via Google OAuth</strong>
                <span className="text-[#52534e] text-[11px] leading-relaxed block">
                  Tanpa perlu membuat kata sandi baru, login praktis dan aman dengan akun Google.
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Actions & Checkbox */}
        <div className="px-6 sm:px-7 pb-6 space-y-4">
          <button
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-2.5 bg-[#111210] hover:bg-black text-white font-bold py-3 px-4 rounded-xl text-xs sm:text-sm transition-all cursor-pointer shadow-md"
          >
            <svg className="w-4 h-4 bg-white rounded-full p-0.5" viewBox="0 0 24 24">
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

          {/* Don't show again checkbox */}
          <div className="flex items-center justify-center gap-2 pt-1">
            <input
              id="dont-show-promo-l2"
              type="checkbox"
              checked={dontShowAgain}
              onChange={(e) => setDontShowAgain(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-[#111210] focus:ring-[#111210] cursor-pointer"
            />
            <label htmlFor="dont-show-promo-l2" className="text-[11px] text-[#52534e] font-medium cursor-pointer select-none">
              Jangan tampilkan lagi pesan promosi ini
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
