"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import {
  Menu,
  X,
  LogIn,
  LogOut,
  History,
  BookOpen,
  ChevronDown,
  TrendingUp,
  ShieldAlert,
  Calculator,
  LayoutGrid,
  HelpCircle,
} from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import HistoryModal from "@/features/calculators/components/HistoryModal";
import LoginPromoModal from "@/components/feedback/LoginPromoModal";
import AppLogo from "@/components/layout/AppLogo";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [calcDropdownOpen, setCalcDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [user, setUser] = useState<{
    id: string;
    email: string;
    name?: string;
    image?: string;
  } | null>(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isPromoModalOpen, setIsPromoModalOpen] = useState(false);

  const navHeaderRef = useRef<HTMLElement>(null);
  const userDropdownRef = useRef<HTMLDivElement>(null);

  const fetchUser = async () => {
    try {
      const res = await fetch("/api/auth/me-user");
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      }
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        navHeaderRef.current &&
        !navHeaderRef.current.contains(event.target as Node)
      ) {
        setCalcDropdownOpen(false);
      }
      if (
        userDropdownRef.current &&
        !userDropdownRef.current.contains(event.target as Node)
      ) {
        setUserDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await fetch("/api/auth/me-user", { method: "DELETE" });
    setUser(null);
    setUserDropdownOpen(false);
    window.location.reload();
  };

  const calculatorItems = [
    {
      title: "Target Jual / Beli",
      desc: "Hitung estimasi target profit & rekomendasi harga jual/beli.",
      href: "/#prediction",
      icon: TrendingUp,
      color: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    },
    {
      title: "Auto Rejection (ARA / ARB)",
      desc: "Batas atas & bawah pergerakan harga saham simetris.",
      href: "/#ara-arb",
      icon: ShieldAlert,
      color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    },
    {
      title: "Average Up / Down",
      desc: "Hitung harga rata-rata posisi baru & modal lot tambahan.",
      href: "/#avg-up-down",
      icon: Calculator,
      color: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
    },
    {
      title: "Semua Alat Kalkulasi",
      desc: "Ringkasan lengkap suite kalkulator analisis saham.",
      href: "/#calculator",
      icon: LayoutGrid,
      color: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    },
  ];

  return (
    <>
      <header
        ref={navHeaderRef}
        className="sticky top-0 z-50 w-full bg-card/95 backdrop-blur-md transition-colors duration-300 border-b border-border-custom/30"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex gap-8 items-center">
              {/* Logo Brand */}
              <Link
                href="/"
                className="flex items-center gap-2.5 font-extrabold text-lg text-main"
              >
                <AppLogo size={32} />
                <span>Hitungsaham</span>
              </Link>

              {/* Desktop Navigation with Hover Mega Menu */}
              <nav className="hidden md:flex items-center gap-2">
                <div
                  className="relative group py-2"
                  onMouseEnter={() => setCalcDropdownOpen(true)}
                  onMouseLeave={() => setCalcDropdownOpen(false)}
                >
                  <button
                    onClick={() => setCalcDropdownOpen(!calcDropdownOpen)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer focus:outline-none ${
                      calcDropdownOpen
                        ? "bg-sub-blue text-acc-blue"
                        : "text-sub hover:bg-sub-blue hover:text-acc-blue"
                    }`}
                    aria-expanded={calcDropdownOpen}
                  >
                    <span>Kalkulator</span>
                    <ChevronDown
                      size={14}
                      className={`transition-transform duration-200 ${calcDropdownOpen ? "rotate-180" : ""}`}
                    />
                  </button>
                </div>

                <Link
                  href="/blog"
                  className="text-sub hover:bg-sub-blue hover:text-acc-blue px-3 py-2 rounded-xl text-xs font-bold transition-all duration-200 flex items-center gap-1.5"
                >
                  <BookOpen size={14} />
                  <span>Blog &amp; Artikel</span>
                </Link>

                <Link
                  href="/faq"
                  className="text-sub hover:bg-sub-blue hover:text-acc-blue px-3 py-2 rounded-xl text-xs font-bold transition-all duration-200 flex items-center gap-1.5"
                >
                  <HelpCircle size={14} />
                  <span>FAQ</span>
                </Link>
              </nav>
            </div>

            {/* Controls (Desktop) */}
            <div className="hidden md:flex items-center gap-3">
              <ThemeToggle />

              {user ? (
                <div className="relative" ref={userDropdownRef}>
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-1.5 p-1 rounded-full hover:ring-2 hover:ring-acc-blue/30 transition-all cursor-pointer focus:outline-none"
                    aria-label="User menu"
                  >
                    {user.image ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={user.image}
                        alt={user.name || "User"}
                        className="w-9 h-9 rounded-full border border-border-custom object-cover"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-sub-blue text-acc-blue flex items-center justify-center font-bold text-sm">
                        {user.name?.[0]?.toUpperCase() || "U"}
                      </div>
                    )}
                  </button>

                  {userDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-card rounded-2xl border border-border-custom/60 shadow-xl py-2 z-50 animate-fade-in text-main divide-y divide-border-custom/50">
                      <div className="px-4 py-3 space-y-0.5">
                        <div className="text-sm font-bold truncate text-main">
                          {user.name || "Pengguna"}
                        </div>
                        <div className="text-xs text-muted truncate font-medium">
                          {user.email}
                        </div>
                      </div>

                      <div className="py-1">
                        <button
                          onClick={() => {
                            setUserDropdownOpen(false);
                            setIsHistoryOpen(true);
                          }}
                          className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-main hover:bg-sub-blue hover:text-acc-blue transition-colors cursor-pointer"
                        >
                          <History size={16} />
                          <span>Histori Perhitungan Saya</span>
                        </button>
                      </div>

                      <div className="py-1">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-acc-pink hover:bg-sub-pink transition-colors cursor-pointer"
                        >
                          <LogOut size={16} />
                          <span>Sign out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => setIsPromoModalOpen(true)}
                  className="flex items-center gap-2 bg-sub-slate hover:bg-sub-blue hover:text-acc-blue text-main px-3.5 py-2 rounded-xl text-xs font-bold transition-all border border-border-custom/40 cursor-pointer"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
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
                  <span>Login Google</span>
                </button>
              )}
            </div>

            {/* Mobile Hamburger Button */}
            <div className="flex md:hidden items-center gap-2">
              <ThemeToggle />
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 rounded-xl text-main hover:bg-sub-slate transition-colors"
                aria-label="Toggle Menu"
              >
                {isOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* FULL-WIDTH MEGA MENU PANEL */}
        {calcDropdownOpen && (
          <div
            onMouseEnter={() => setCalcDropdownOpen(true)}
            onMouseLeave={() => setCalcDropdownOpen(false)}
            className="absolute top-full left-0 right-0 w-full bg-card/98 backdrop-blur-xl border-b border-border-custom/50 shadow-2xl z-50 animate-fade-in text-main"
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
              <div className="text-[11px] font-extrabold text-muted uppercase tracking-wider mb-4 px-2">
                Kalkulator Saham
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {calculatorItems.map((item) => {
                  const IconComponent = item.icon;
                  return (
                    <Link
                      key={item.title}
                      href={item.href}
                      onClick={() => setCalcDropdownOpen(false)}
                      className="p-4 rounded-2xl bg-sub-slate/50 hover:bg-sub-blue/80 hover:border-acc-blue/30 border border-transparent transition-all flex flex-col gap-3 group cursor-pointer"
                    >
                      <div
                        className={`w-10 h-10 rounded-xl ${item.color} flex items-center justify-center shrink-0`}
                      >
                        <IconComponent size={20} />
                      </div>
                      <div className="space-y-1">
                        <div className="text-xs font-extrabold text-main group-hover:text-acc-blue transition-colors">
                          {item.title}
                        </div>
                        <p className="text-[11px] text-muted leading-relaxed line-clamp-3">
                          {item.desc}
                        </p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Mobile Drawer Navigation */}
        {isOpen && (
          <div className="md:hidden border-t border-border-custom bg-card px-4 py-4 space-y-3 transition-all duration-300">
            {user ? (
              <div className="pb-3 border-b border-border-custom/50 space-y-2.5">
                <div className="flex items-center gap-3 px-1">
                  {user.image ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={user.image}
                      alt={user.name || "User"}
                      className="w-10 h-10 rounded-full border border-border-custom"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-sub-blue text-acc-blue flex items-center justify-center font-bold text-sm">
                      {user.name?.[0]?.toUpperCase() || "U"}
                    </div>
                  )}
                  <div className="min-w-0">
                    <div className="text-sm font-bold text-main truncate">
                      {user.name}
                    </div>
                    <div className="text-xs text-muted truncate">
                      {user.email}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      setIsHistoryOpen(true);
                    }}
                    className="p-2.5 rounded-xl bg-sub-blue text-acc-blue font-bold text-xs flex items-center justify-center gap-1.5"
                  >
                    <History size={15} /> Histori Saya
                  </button>
                  <button
                    onClick={handleLogout}
                    className="p-2.5 rounded-xl bg-sub-pink text-acc-pink font-bold text-xs flex items-center justify-center gap-1.5"
                  >
                    <LogOut size={15} /> Sign out
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => {
                  setIsOpen(false);
                  setIsPromoModalOpen(true);
                }}
                className="flex items-center justify-center gap-2 w-full bg-sub-blue text-acc-blue font-bold py-2.5 rounded-xl text-xs cursor-pointer"
              >
                <LogIn size={16} /> Login dengan Google
              </button>
            )}

            <nav className="flex flex-col space-y-1">
              <div className="px-3 py-1.5 text-[11px] font-extrabold text-muted uppercase tracking-wider">
                Kalkulator Saham
              </div>

              {calculatorItems.map((item) => {
                const IconComp = item.icon;
                return (
                  <Link
                    key={item.title}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-main hover:bg-sub-blue hover:text-acc-blue transition-all"
                  >
                    <div className={`p-1.5 rounded-lg ${item.color}`}>
                      <IconComp size={15} />
                    </div>
                    <span>{item.title}</span>
                  </Link>
                );
              })}

              <div className="pt-2 border-t border-border-custom/50 space-y-1">
                <Link
                  href="/blog"
                  onClick={() => setIsOpen(false)}
                  className="text-main font-bold hover:bg-sub-blue hover:text-acc-blue px-3 py-2.5 rounded-xl text-xs transition-all flex items-center gap-2.5"
                >
                  <BookOpen size={15} />
                  <span>Blog &amp; Artikel</span>
                </Link>
                <Link
                  href="/faq"
                  onClick={() => setIsOpen(false)}
                  className="text-main font-bold hover:bg-sub-blue hover:text-acc-blue px-3 py-2.5 rounded-xl text-xs transition-all flex items-center gap-2.5"
                >
                  <HelpCircle size={15} />
                  <span>FAQ Bantuan</span>
                </Link>
              </div>
            </nav>
          </div>
        )}
      </header>

      <HistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
      />
      <LoginPromoModal
        isOpen={isPromoModalOpen}
        onClose={() => setIsPromoModalOpen(false)}
      />
    </>
  );
}
