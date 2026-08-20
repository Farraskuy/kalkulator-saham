"use client";

import React, { useState, useCallback } from "react";
import Link from "next/link";
import {
  CircleUserRound,
  Menu,
  X,
  Calculator,
  BookOpen,
  HelpCircle,
} from "lucide-react";
import AppLogo from "@/components/layout/AppLogo";
import LandingLoginModal from "./LandingLoginModal";
import ThemeToggle from "@/components/layout/ThemeToggle";

export default function LandingHeader() {
  const [mobileOpen, setMobileOpen] = useState<boolean>(false);
  const [isClosing, setIsClosing] = useState<boolean>(false);
  const [loginModalOpen, setLoginModalOpen] = useState<boolean>(false);

  const openDrawer = useCallback(() => {
    setIsClosing(false);
    setMobileOpen(true);
  }, []);

  const closeDrawer = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => {
      setMobileOpen(false);
      setIsClosing(false);
    }, 250);
  }, []);

  return (
    <>
      <header className="sticky top-0 z-50 w-full h-[76px] px-4 sm:px-8 md:px-16 flex items-center justify-between bg-(--landing-header) backdrop-blur-md border-b border-(--landing-border)">
        <div className="max-w-[1200px] w-full mx-auto flex items-center justify-between">
          <Link
            className="flex items-center gap-2.5 text-(--landing-text) text-[21px] font-bold tracking-[-0.6px] no-underline"
            href="/"
            aria-label="HitungSaham home"
          >
            <AppLogo size={28} variant="auto" />
            <span>HitungSaham</span>
          </Link>

          <nav
            className="hidden md:flex items-center gap-7 sm:gap-8 [&>a]:text-xs [&>a]:font-medium [&>a]:text-(--landing-muted) [&>a]:hover:text-(--landing-text) [&>a]:transition-colors"
            aria-label="Navigasi utama"
          >
            <Link href="/#calculator">Kalkulator Saham</Link>
            <Link href="/blog">Blog &amp; Artikel</Link>
            <Link href="/faq">FAQ</Link>
          </nav>

          <div className="hidden items-center gap-2 md:flex">
            <ThemeToggle />
            <button
              onClick={() => setLoginModalOpen(true)}
              className="rounded-lg px-[18px] py-[9px] inline-flex items-center gap-2 text-(--landing-text) bg-(--landing-soft) hover:bg-(--landing-soft-strong) text-xs font-semibold no-underline transition-all cursor-pointer"
              type="button"
            >
              <CircleUserRound size={16} /> Masuk Google
            </button>
          </div>

          {/* Mobile: Theme Toggle + Hamburger */}
          <div className="md:hidden flex items-center gap-1">
            <ThemeToggle />
            <button
              className="border-0 text-(--landing-text) bg-transparent cursor-pointer p-1"
              type="button"
              onClick={() => (mobileOpen ? closeDrawer() : openDrawer())}
              aria-label="Buka navigasi"
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </header>

      {/* OFFCANVAS MOBILE DRAWER MENU — rendered outside header to avoid clipping */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[200] flex justify-start">
          {/* Backdrop Overlay */}
          <div
            className={`fixed inset-0 bg-black/60 cursor-pointer ${isClosing ? "backdrop-exit" : "backdrop-enter"}`}
            onClick={closeDrawer}
          />

          {/* Offcanvas Drawer Content */}
          <div
            className={`relative z-10 flex h-full w-4/5 max-w-sm flex-col justify-between overflow-y-auto bg-page p-6 text-main shadow-2xl ${isClosing ? "drawer-exit" : "drawer-enter"}`}
          >
            <div className="space-y-6">
              {/* Header in Drawer */}
              <div className="flex items-center justify-between border-b border-border-custom pb-4">
                <div className="flex items-center gap-2.5 text-lg font-bold text-main">
                  <AppLogo size={28} variant="auto" />
                  <span>HitungSaham</span>
                </div>
                <button
                  onClick={closeDrawer}
                  className="cursor-pointer rounded-full p-2 text-main transition-colors hover:bg-sub-slate"
                  aria-label="Tutup menu"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Nav Links */}
              <nav className="flex flex-col space-y-2">
                <Link
                  href="/#calculator"
                  onClick={closeDrawer}
                  className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-main transition-colors hover:bg-sub-slate"
                >
                  <Calculator size={18} className="text-muted" />
                  <span>Kalkulator Saham</span>
                </Link>

                <Link
                  href="/blog"
                  onClick={closeDrawer}
                  className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-main transition-colors hover:bg-sub-slate"
                >
                  <BookOpen size={18} className="text-muted" />
                  <span>Blog &amp; Artikel</span>
                </Link>

                <Link
                  href="/faq"
                  onClick={closeDrawer}
                  className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-main transition-colors hover:bg-sub-slate"
                >
                  <HelpCircle size={18} className="text-muted" />
                  <span>FAQ</span>
                </Link>
              </nav>
            </div>

            {/* Drawer Bottom Actions */}
            <div className="space-y-3 border-t border-border-custom pt-6">
              <div className="flex items-center justify-between rounded-xl bg-sub-slate px-3 py-2 text-sm font-semibold text-main">
                <span>Tema tampilan</span>
                <ThemeToggle />
              </div>
              <button
                onClick={() => {
                  closeDrawer();
                  setTimeout(() => setLoginModalOpen(true), 260);
                }}
                className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-main px-4 py-3 text-xs font-extrabold text-page transition-colors"
              >
                <CircleUserRound size={16} />
                <span>Masuk Google</span>
              </button>
              <div className="text-center text-[11px] text-muted">
                &copy; {new Date().getFullYear()} HitungSaham.com
              </div>
            </div>
          </div>
        </div>
      )}

      {/* GOOGLE LOGIN PROMO MODAL */}
      <LandingLoginModal
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
      />
    </>
  );
}
