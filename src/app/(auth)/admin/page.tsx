'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ArrowRight, BookOpen, Calculator, Download, FilePenLine, LoaderCircle, Plus, Users } from 'lucide-react';
import { formatNumber } from '@/lib/utils/formatters';

interface AnalyticsData {
  summary: {
    totalTraffic: number;
    totalUsers: number;
    totalCalculations: number;
    totalDownloads: number;
    totalShares: number;
    totalArticles: number;
    publishedArticles: number;
    draftArticles: number;
  };
  calculatorStats: Record<string, { download: number; share: number }>;
  referrers: Array<{ name: string; value: number }>;
  recentActions: Array<{ id: string; calculatorType: string; action: string; timestamp: string }>;
}

export default function AdminDashboardPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/analytics/dashboard')
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Dashboard gagal dimuat.');
        return data;
      })
      .then(setAnalytics)
      .catch((loadError) => setError(loadError instanceof Error ? loadError.message : 'Dashboard gagal dimuat.'));
  }, []);

  if (!analytics && !error) {
    return <div className="flex min-h-72 items-center justify-center gap-2 text-sm font-medium text-muted"><LoaderCircle size={18} className="animate-spin text-acc-blue" /> Memuat dashboard...</div>;
  }

  return (
    <div className="mx-auto max-w-[1280px] space-y-5 pb-10">
      <div className="flex flex-col gap-4 border-b border-border-custom pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div><p className="text-xs font-semibold text-acc-blue">Overview</p><h1 className="mt-0.5 text-xl font-bold tracking-tight text-main sm:text-2xl">Dashboard CMS</h1><p className="mt-1 text-sm text-muted">Ringkasan konten, pengguna, dan penggunaan kalkulator.</p></div>
        <Link href="/admin/articles/new" className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-acc-blue px-4 text-sm font-semibold text-white"><Plus size={17} /> Tulis artikel</Link>
      </div>

      {error && <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/40">{error}</div>}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Total kunjungan" value={analytics?.summary.totalTraffic || 0} helper="Trafik tercatat" icon={Users} tone="blue" />
        <MetricCard label="Pengguna terdaftar" value={analytics?.summary.totalUsers || 0} helper="Akun Google" icon={Users} tone="green" />
        <MetricCard label="Riwayat kalkulasi" value={analytics?.summary.totalCalculations || 0} helper="Tersimpan pengguna" icon={Calculator} tone="amber" />
        <MetricCard label="Ekspor & bagikan" value={(analytics?.summary.totalDownloads || 0) + (analytics?.summary.totalShares || 0)} helper="Interaksi konten" icon={Download} tone="violet" />
      </div>

      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
        <section className="overflow-hidden rounded-2xl border border-border-custom bg-card">
          <div className="flex items-center justify-between border-b border-border-custom px-5 py-4"><div><h2 className="text-sm font-bold text-main">Sumber trafik</h2><p className="mt-0.5 text-xs text-muted">Maksimal 1.000 kunjungan terbaru.</p></div></div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm"><thead className="bg-sub-slate/60 text-xs font-semibold text-muted"><tr><th className="px-5 py-3">Sumber</th><th className="px-5 py-3 text-right">Kunjungan</th></tr></thead><tbody className="divide-y divide-border-custom">{analytics?.referrers.map((referrer) => <tr key={referrer.name}><td className="px-5 py-3.5 font-medium text-main">{referrer.name}</td><td className="px-5 py-3.5 text-right font-semibold text-main">{formatNumber(referrer.value)}</td></tr>)}{!analytics?.referrers.length && <tr><td colSpan={2} className="px-5 py-12 text-center text-sm text-muted">Belum ada data trafik.</td></tr>}</tbody></table>
          </div>
        </section>

        <section className="rounded-2xl border border-border-custom bg-card">
          <div className="border-b border-border-custom px-5 py-4"><h2 className="text-sm font-bold text-main">Status konten</h2><p className="mt-0.5 text-xs text-muted">Ringkasan artikel dan blog.</p></div>
          <div className="space-y-3 p-5">
            <ContentRow label="Semua konten" value={analytics?.summary.totalArticles || 0} icon={BookOpen} tone="text-acc-blue bg-sub-blue" />
            <ContentRow label="Published" value={analytics?.summary.publishedArticles || 0} icon={BookOpen} tone="text-emerald-600 bg-emerald-500/10" />
            <ContentRow label="Draft" value={analytics?.summary.draftArticles || 0} icon={FilePenLine} tone="text-amber-600 bg-amber-500/10" />
            <Link href="/admin/articles" className="mt-2 flex h-10 items-center justify-between rounded-xl border border-border-custom px-3.5 text-sm font-semibold text-main hover:bg-sub-slate">Kelola konten <ArrowRight size={16} className="text-muted" /></Link>
          </div>
        </section>
      </div>

      <section className="overflow-hidden rounded-2xl border border-border-custom bg-card">
        <div className="border-b border-border-custom px-5 py-4"><h2 className="text-sm font-bold text-main">Aktivitas kalkulator</h2><p className="mt-0.5 text-xs text-muted">Jumlah ekspor dan bagikan berdasarkan fitur.</p></div>
        <div className="overflow-x-auto"><table className="w-full min-w-[560px] text-left text-sm"><thead className="bg-sub-slate/60 text-xs font-semibold text-muted"><tr><th className="px-5 py-3">Kalkulator</th><th className="px-5 py-3 text-center">Unduh</th><th className="px-5 py-3 text-center">Bagikan</th></tr></thead><tbody className="divide-y divide-border-custom">{[['ara-arb','ARA / ARB'],['average','Average Up / Down'],['prediction','Target Jual / Beli']].map(([key,label]) => <tr key={key}><td className="px-5 py-3.5 font-medium text-main">{label}</td><td className="px-5 py-3.5 text-center font-semibold text-main">{analytics?.calculatorStats[key]?.download || 0}</td><td className="px-5 py-3.5 text-center font-semibold text-main">{analytics?.calculatorStats[key]?.share || 0}</td></tr>)}</tbody></table></div>
      </section>
    </div>
  );
}

function MetricCard({ label, value, helper, icon: Icon, tone }: { label: string; value: number; helper: string; icon: typeof Users; tone: 'blue' | 'green' | 'amber' | 'violet' }) {
  const tones = { blue: 'bg-sub-blue text-acc-blue', green: 'bg-emerald-500/10 text-emerald-600', amber: 'bg-amber-500/10 text-amber-600', violet: 'bg-violet-500/10 text-violet-600' };
  return <div className="rounded-2xl border border-border-custom bg-card p-4"><div className="flex items-start justify-between"><div><p className="text-xs font-medium text-muted">{label}</p><p className="mt-2 text-2xl font-bold tracking-tight text-main">{formatNumber(value)}</p><p className="mt-1 text-[11px] text-muted">{helper}</p></div><div className={`flex h-10 w-10 items-center justify-center rounded-xl ${tones[tone]}`}><Icon size={18} /></div></div></div>;
}

function ContentRow({ label, value, icon: Icon, tone }: { label: string; value: number; icon: typeof BookOpen; tone: string }) {
  return <div className="flex items-center justify-between rounded-xl border border-border-custom p-3"><div className="flex items-center gap-3"><span className={`flex h-8 w-8 items-center justify-center rounded-lg ${tone}`}><Icon size={15} /></span><span className="text-sm font-medium text-main">{label}</span></div><span className="text-sm font-bold text-main">{value}</span></div>;
}
