'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  CircleUserRound,
  Menu,
  X,
  Calculator,
  BookOpen,
  HelpCircle,
} from 'lucide-react';
import AppLogo from '@/components/layout/AppLogo';
import styles from '../landing-2.module.css';
import LandingTwoLoginModal from './LandingTwoLoginModal';

export default function LandingTwoHeader() {
  const [mobileOpen, setMobileOpen] = useState<boolean>(false);
  const [loginModalOpen, setLoginModalOpen] = useState<boolean>(false);

  return (
    <>
      <header className={styles.header}>
        <div className="max-w-300 w-full mx-auto flex items-center justify-between">
          <Link className={styles.logo} href="/landing-2" aria-label="HitungSaham home">
            <AppLogo size={28} variant="dark-icon" />
            <span>HitungSaham</span>
          </Link>

          <nav className={styles.nav} aria-label="Navigasi utama">
            <Link href="/landing-2#calculator">Kalkulator Saham</Link>
            <Link href="/landing-2/blog">Blog &amp; Artikel</Link>
            <Link href="/landing-2/faq">FAQ</Link>
          </nav>

          {/* Login Google Popup Trigger Button */}
          <button
            onClick={() => setLoginModalOpen(true)}
            className={styles.loginButton}
            type="button"
          >
            <CircleUserRound size={16} /> Masuk Google
          </button>

          {/* Mobile Hamburger Button Trigger */}
          <button
            className={styles.menuButton}
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Buka navigasi"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* OFFCANVAS MOBILE DRAWER MENU FOR LANDING 2 */}
        {mobileOpen && (
          <div className="fixed inset-0 z-50 flex justify-end">
            {/* Backdrop Overlay */}
            <div
              className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity cursor-pointer"
              onClick={() => setMobileOpen(false)}
            />

            {/* Offcanvas Drawer Content */}
            <div className="relative z-10 w-4/5 max-w-sm h-full bg-[#f7f7f5] text-[#111210] p-6 shadow-2xl flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-300">
              <div className="space-y-6">
                {/* Header in Drawer */}
                <div className="flex items-center justify-between pb-4 border-b border-black/10">
                  <div className="flex items-center gap-2.5 font-bold text-lg text-[#111210]">
                    <AppLogo size={28} variant="dark-icon" />
                    <span>HitungSaham</span>
                  </div>
                  <button
                    onClick={() => setMobileOpen(false)}
                    className="p-2 rounded-full hover:bg-black/5 text-[#111210] transition-colors cursor-pointer"
                    aria-label="Tutup menu"
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Nav Links */}
                <nav className="flex flex-col space-y-2">
                  <Link
                    href="/landing-2#calculator"
                    onClick={() => setMobileOpen(false)}
                    className="px-4 py-3 rounded-xl font-bold text-sm text-[#111210] hover:bg-[#ebebeb] transition-colors flex items-center gap-3"
                  >
                    <Calculator size={18} className="text-[#52534e]" />
                    <span>Kalkulator Saham</span>
                  </Link>

                  <Link
                    href="/landing-2/blog"
                    onClick={() => setMobileOpen(false)}
                    className="px-4 py-3 rounded-xl font-bold text-sm text-[#111210] hover:bg-[#ebebeb] transition-colors flex items-center gap-3"
                  >
                    <BookOpen size={18} className="text-[#52534e]" />
                    <span>Blog &amp; Artikel</span>
                  </Link>

                  <Link
                    href="/landing-2/faq"
                    onClick={() => setMobileOpen(false)}
                    className="px-4 py-3 rounded-xl font-bold text-sm text-[#111210] hover:bg-[#ebebeb] transition-colors flex items-center gap-3"
                  >
                    <HelpCircle size={18} className="text-[#52534e]" />
                    <span>FAQ</span>
                  </Link>
                </nav>
              </div>

              {/* Drawer Bottom Actions */}
              <div className="pt-6 border-t border-black/10 space-y-3">
                <button
                  onClick={() => {
                    setMobileOpen(false);
                    setLoginModalOpen(true);
                  }}
                  className="w-full py-3 px-4 rounded-xl bg-[#111210] text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-md transition-colors cursor-pointer"
                >
                  <CircleUserRound size={16} />
                  <span>Masuk Google</span>
                </button>
                <div className="text-[11px] text-center text-[#82837e]">
                  &copy; {new Date().getFullYear()} HitungSaham.com
                </div>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* LANDING 2 GOOGLE LOGIN PROMO MODAL */}
      <LandingTwoLoginModal
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
      />
    </>
  );
}
