'use client';

import React, { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  BarChart3,
  ListRestart,
  Percent,
  FileText,
  Lock,
  LogOut,
  Menu,
  X,
  ChevronDown,
  RefreshCw,
  HelpCircle,
  BookOpen,
  Tag,
} from 'lucide-react';
import ThemeToggle from '@/components/layout/ThemeToggle';
import AppLogo from '@/components/layout/AppLogo';

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: BarChart3 },
  { href: '/admin/articles', label: 'Kelola Artikel & Blog', icon: BookOpen },
  { href: '/admin/categories', label: 'Kategori Artikel', icon: Tag },
  { href: '/admin/fractions', label: 'Fraksi Harga BEI', icon: ListRestart },
  { href: '/admin/ara-arb', label: 'Aturan ARA / ARB', icon: Percent },
  { href: '/admin/faqs', label: 'Kelola FAQ', icon: HelpCircle },
  { href: '/admin/settings', label: 'Syarat & Ketentuan', icon: FileText },
  { href: '/admin/security', label: 'Ganti Password', icon: Lock },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  useEffect(() => {
    // Verify session
    let isMounted = true;
    fetch('/api/auth/me')
      .then((res) => {
        if (!res.ok) {
          router.push('/login');
        } else if (isMounted) {
          setAuthenticated(true);
        }
      })
      .catch(() => {
        if (isMounted) router.push('/login');
      });

    return () => {
      isMounted = false;
    };
  }, [router]);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 11) return 'Selamat Pagi ☀️';
    if (hour < 15) return 'Selamat Siang 🌤️';
    if (hour < 18) return 'Selamat Sore 🌇';
    return 'Selamat Malam 🌙';
  };

  if (authenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-page text-main">
        <div className="flex items-center gap-3 font-bold text-sm">
          <RefreshCw size={20} className="animate-spin text-acc-blue" />
          <span>Memuat Admin Panel...</span>
        </div>
      </div>
    );
  }

  if (!authenticated) return null;

  const activeNav = navItems.find((item) => item.href === pathname) || navItems[0];

  return (
    <div className="h-screen flex overflow-hidden bg-page text-main transition-colors duration-300">
      {/* SIDEBAR FOR DESKTOP */}
      <aside className="hidden md:flex flex-col w-64 h-screen sticky top-0 shrink-0 bg-card border-r border-border-custom transition-colors duration-300">
        {/* Brand Logo */}
        <div className="h-16 flex items-center gap-2.5 px-6 shrink-0">
          <AppLogo size={30} />
          <span className="font-extrabold text-sm tracking-wider">Hitungsaham</span>
        </div>

        {/* Master Menu Label */}
        <div className="px-6 pt-6 pb-2 text-[10px] font-extrabold text-muted tracking-widest uppercase shrink-0">
          Master Menu
        </div>

        {/* Sidebar Nav Links */}
        <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all duration-200 ${
                  isActive
                    ? 'bg-acc-blue text-white  shadow-acc-blue/20'
                    : 'text-sub hover:bg-sub-slate hover:text-main'
                }`}
              >
                <Icon size={16} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* MOBILE DRAWER SIDEBAR */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden bg-black/50 backdrop-blur-sm">
          <div className="w-64 bg-card h-full flex flex-col border-r border-border-custom animate-slide-in">
            <div className="h-16 flex items-center justify-between px-6 shrink-0">
              <div className="flex items-center gap-2.5">
                <AppLogo size={30} />
                <span className="font-extrabold text-sm tracking-wider uppercase">Hitungsaham</span>
              </div>
              <button onClick={() => setMobileSidebarOpen(false)} className="text-main">
                <X size={20} />
              </button>
            </div>

            <div className="px-6 pt-6 pb-2 text-[10px] font-extrabold text-muted tracking-widest uppercase shrink-0">
              Master Menu
            </div>

            <nav className="grow px-4 space-y-1.5 overflow-y-auto">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileSidebarOpen(false)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all duration-200 ${
                      isActive
                        ? 'bg-acc-blue text-white '
                        : 'text-sub hover:bg-sub-slate'
                    }`}
                  >
                    <Icon size={16} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      )}

      {/* MAIN CONTAINER */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* TOP BAR */}
        <header className="h-16 shrink-0 bg-card  flex items-center justify-between px-4 sm:px-6 z-10 transition-colors duration-300">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="p-1.5 rounded-lg text-main hover:bg-sub-slate md:hidden"
            >
              <Menu size={22} />
            </button>
            <h1 className="font-extrabold text-lg tracking-tight capitalize text-main">
              {activeNav.label}
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <ThemeToggle />

            <div className="relative">
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-2 bg-sub-slate/50 hover:bg-sub-slate px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer text-main"
              >
                <div className="w-5 h-5 rounded-full bg-acc-blue text-white flex items-center justify-center font-bold text-[10px]">
                  A
                </div>
                <span className="hidden sm:inline">admin@credisuite.com</span>
                <ChevronDown size={14} className="opacity-60" />
              </button>

              {profileDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-20" onClick={() => setProfileDropdownOpen(false)} />
                  <div className="absolute right-0 mt-2 w-56 bg-card  rounded-2xl shadow-xl z-30 p-2 text-main animate-fade-in">
                    <div className="px-3 py-2.5 ">
                      <p className="text-[10px] font-bold text-muted uppercase tracking-wider">{getGreeting()}</p>
                      <p className="text-xs font-extrabold mt-0.5 truncate text-main">Administrator</p>
                    </div>
                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        handleLogout();
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 mt-1 rounded-xl text-left text-xs font-bold text-acc-pink hover:bg-sub-pink transition-colors cursor-pointer"
                    >
                      <LogOut size={15} />
                      <span>Logout Sesi</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* MAIN PAGE CONTENT (Independent Vertical Scroll) */}
        <main className="flex-1 p-4 sm:p-6 overflow-y-auto max-w-7xl w-full mx-auto space-y-6">
          {children}
        </main>
      </div>
    </div>
  );
}
