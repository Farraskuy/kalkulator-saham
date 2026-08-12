'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  BarChart3,
  BookOpen,
  ChevronDown,
  FileText,
  HelpCircle,
  ListRestart,
  Lock,
  LogOut,
  Menu,
  Percent,
  RefreshCw,
  Tag,
  X,
} from 'lucide-react';
import AppLogo from '@/components/layout/AppLogo';
import ThemeToggle from '@/components/layout/ThemeToggle';
import { ToastProvider } from '@/components/ui/Toast';

const navGroups = [
  {
    label: 'Overview',
    items: [{ href: '/admin', label: 'Dashboard', icon: BarChart3 }],
  },
  {
    label: 'Konten',
    items: [
      { href: '/admin/articles', label: 'Artikel & Blog', icon: BookOpen },
      { href: '/admin/categories', label: 'Kategori Artikel', icon: Tag },
      { href: '/admin/faqs', label: 'FAQ', icon: HelpCircle },
    ],
  },
  {
    label: 'Konfigurasi',
    items: [
      { href: '/admin/fractions', label: 'Fraksi Harga BEI', icon: ListRestart },
      { href: '/admin/ara-arb', label: 'Aturan ARA / ARB', icon: Percent },
      { href: '/admin/settings', label: 'Syarat & Ketentuan', icon: FileText },
      { href: '/admin/security', label: 'Keamanan Akun', icon: Lock },
    ],
  },
];

const navItems = navGroups.flatMap((group) => group.items);

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [email, setEmail] = useState('Administrator');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  useEffect(() => {
    let active = true;
    fetch('/api/auth/me')
      .then(async (response) => {
        if (!response.ok) throw new Error('Unauthorized');
        return response.json();
      })
      .then((data) => {
        if (!active) return;
        setEmail(data.email || 'Administrator');
        setAuthenticated(true);
      })
      .catch(() => router.replace('/login'));
    return () => {
      active = false;
    };
  }, [router]);

  useEffect(() => {
    setMobileSidebarOpen(false);
    setProfileOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.replace('/login');
    router.refresh();
  };

  if (authenticated === null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-page text-main">
        <div className="flex items-center gap-2.5 text-sm font-semibold text-muted">
          <RefreshCw size={18} className="animate-spin text-acc-blue" /> Memuat CMS...
        </div>
      </div>
    );
  }
  if (!authenticated) return null;

  const activeNav = navItems.find((item) => item.href === '/admin' ? pathname === '/admin' : pathname.startsWith(item.href)) ?? navItems[0];

  const sidebarContent = (
    <>
      <div className="flex h-16 shrink-0 items-center gap-3 border-b border-border-custom px-5">
        <AppLogo size={31} />
        <div className="min-w-0">
          <p className="truncate text-sm font-bold tracking-tight text-main">HitungSaham</p>
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">Admin CMS</p>
        </div>
      </div>
      <nav className="grow overflow-y-auto px-3 py-5">
        {navGroups.map((group, groupIndex) => (
          <div key={group.label} className={groupIndex ? 'mt-6' : ''}>
            <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-muted">{group.label}</p>
            <div className="space-y-1">
              {group.items.map((item) => {
                const Icon = item.icon;
                const active = item.href === '/admin' ? pathname === '/admin' : pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex min-h-10 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors ${
                      active ? 'bg-acc-blue text-white' : 'text-sub hover:bg-sub-slate hover:text-main'
                    }`}
                  >
                    <Icon size={17} strokeWidth={active ? 2.3 : 2} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
      <div className="border-t border-border-custom p-3">
        <Link href="/" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-muted hover:bg-sub-slate hover:text-main">
          <FileText size={17} /> Lihat website
        </Link>
      </div>
    </>
  );

  return (
    <ToastProvider>
      <div className="flex h-screen w-full overflow-hidden bg-page text-main">
        {/* DESKTOP SIDEBAR */}
        <aside className="hidden w-64 shrink-0 border-r border-border-custom bg-card md:flex md:flex-col">
          {sidebarContent}
        </aside>

        {/* MOBILE SIDEBAR MODAL */}
        {mobileSidebarOpen && (
          <div className="fixed inset-0 z-50 flex md:hidden">
            <button className="absolute inset-0 bg-slate-950/45" onClick={() => setMobileSidebarOpen(false)} aria-label="Tutup menu" />
            <aside className="relative flex h-full w-[min(84vw,280px)] flex-col border-r border-border-custom bg-card">
              {sidebarContent}
              <button onClick={() => setMobileSidebarOpen(false)} className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-lg text-muted hover:bg-sub-slate hover:text-main" aria-label="Tutup sidebar"><X size={19} /></button>
            </aside>
          </div>
        )}

        <div className="flex min-w-0 grow flex-col overflow-hidden">
          <header className="flex h-16 shrink-0 items-center justify-between border-b border-border-custom bg-card px-4 sm:px-6">
            <div className="flex min-w-0 items-center gap-3">
              <button onClick={() => setMobileSidebarOpen(true)} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-muted hover:bg-sub-slate hover:text-main md:hidden" aria-label="Buka menu"><Menu size={20} /></button>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <ThemeToggle />
              <div className="relative">
                <button
                  onClick={() => setProfileOpen((open) => !open)}
                  className="flex h-10 items-center gap-2 rounded-xl border border-border-custom bg-card px-2 text-left hover:bg-sub-slate sm:px-3"
                >
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-acc-blue text-xs font-bold text-white">A</span>
                  <span className="hidden max-w-40 sm:block"><span className="block truncate text-xs font-semibold text-main">Administrator</span><span className="block truncate text-[10px] text-muted">{email}</span></span>
                  <ChevronDown size={14} className="hidden text-muted sm:block" />
                </button>
                {profileOpen && (
                  <>
                    <button className="fixed inset-0 z-20" onClick={() => setProfileOpen(false)} aria-label="Tutup profil" />
                    <div className="absolute right-0 z-30 mt-2 w-64 rounded-2xl border border-border-custom bg-card p-2">
                      <div className="border-b border-border-custom px-3 py-3"><p className="text-xs font-semibold text-main">Administrator</p><p className="mt-0.5 truncate text-xs text-muted">{email}</p></div>
                      <button onClick={handleLogout} className="mt-2 flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-semibold text-rose-600 hover:bg-rose-500/10"><LogOut size={16} /> Keluar dari CMS</button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </header>

          <main className="grow overflow-y-auto">
            <div className="mx-auto w-full max-w-[1440px] p-4 sm:p-6 lg:p-7">{children}</div>
          </main>
        </div>
      </div>
    </ToastProvider>
  );
}
