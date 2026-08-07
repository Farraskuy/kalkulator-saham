'use client';

import React, { useEffect, useState } from 'react';
import {
  User,
  Download,
  ArrowUpRight,
  Clock,
} from 'lucide-react';
import { formatNumber } from '@/lib/calculations';

interface AnalyticsData {
  summary: {
    totalTraffic: number;
    totalUsers: number;
    totalCalculations: number;
    totalDownloads: number;
    totalShares: number;
  };
  calculatorStats: Record<string, { download: number; share: number }>;
  referrers: Array<{ name: string; value: number }>;
  recentActions: Array<{
    id: string;
    calculatorType: string;
    action: string;
    timestamp: string;
  }>;
}

export default function AdminDashboardPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);

  const loadAnalytics = async () => {
    try {
      const res = await fetch('/api/analytics/dashboard');
      if (res.ok) {
        const data = await res.json();
        setAnalytics(data);
      }
    } catch (err) {
      console.error('Failed to load analytics:', err);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, []);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Analytics Header Title */}
      <div>
        <div className="text-[10px] font-bold text-acc-blue uppercase tracking-widest">Analytics & Performance Overview</div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-main mt-0.5">Pemantauan Trafik, Pengguna & Aktivitas</h2>
      </div>

      {/* STATS CARD GRID - 4 Grid Columns */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* CARD 1: TRAFFIC / VISITORS */}
        <div className="bg-card rounded-2xl p-5 space-y-3 border border-border-custom/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-sub-blue text-acc-blue flex items-center justify-center">
                <User size={16} />
              </div>
              <span className="font-extrabold text-xs text-main">Trafik Kunjungan</span>
            </div>
            <div className="w-6 h-6 rounded-full bg-sub-blue text-acc-blue flex items-center justify-center">
              <ArrowUpRight size={13} />
            </div>
          </div>

          <div className="bg-blue-600 text-white rounded-xl p-4 flex items-center justify-between">
            <div>
              <span className="text-[9px] font-extrabold uppercase tracking-wider opacity-85 block">Total Kunjungan</span>
              <span className="text-2xl font-extrabold mt-0.5 block">{formatNumber(analytics?.summary.totalTraffic || 0)}</span>
            </div>
            <User size={24} className="opacity-90" />
          </div>

          <div className="flex items-center justify-between text-[10px] font-semibold text-muted pt-0.5">
            <span>Log Kunjungan Website</span>
            <span className="text-acc-blue font-bold">Realtime</span>
          </div>
        </div>

        {/* CARD 2: REGISTERED USERS (GOOGLE OAUTH) */}
        <div className="bg-card rounded-2xl p-5 space-y-3 border border-border-custom/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                <User size={16} />
              </div>
              <span className="font-extrabold text-xs text-main">User Terdaftar</span>
            </div>
            <div className="w-6 h-6 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
              <ArrowUpRight size={13} />
            </div>
          </div>

          <div className="bg-emerald-600 text-white rounded-xl p-4 flex items-center justify-between">
            <div>
              <span className="text-[9px] font-extrabold uppercase tracking-wider opacity-85 block">Akun Google User</span>
              <span className="text-2xl font-extrabold mt-0.5 block">{formatNumber(analytics?.summary.totalUsers || 0)}</span>
            </div>
            <User size={24} className="opacity-90" />
          </div>

          <div className="flex items-center justify-between text-[10px] font-semibold text-muted pt-0.5">
            <span>Login Terdaftar (OAuth)</span>
            <span className="text-emerald-600 font-bold">Terverifikasi</span>
          </div>
        </div>

        {/* CARD 3: SAVED CALCULATIONS */}
        <div className="bg-card rounded-2xl p-5 space-y-3 border border-border-custom/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center">
                <Clock size={16} />
              </div>
              <span className="font-extrabold text-xs text-main">Histori Kalkulasi</span>
            </div>
            <div className="w-6 h-6 rounded-full bg-amber-500/10 text-amber-600 flex items-center justify-center">
              <ArrowUpRight size={13} />
            </div>
          </div>

          <div className="bg-amber-600 text-white rounded-xl p-4 flex items-center justify-between">
            <div>
              <span className="text-[9px] font-extrabold uppercase tracking-wider opacity-85 block">Total Dihitung & Disimpan</span>
              <span className="text-2xl font-extrabold mt-0.5 block">{formatNumber(analytics?.summary.totalCalculations || 0)}</span>
            </div>
            <Clock size={24} className="opacity-90" />
          </div>

          <div className="flex items-center justify-between text-[10px] font-semibold text-muted pt-0.5">
            <span>Riwayat Simulasi User</span>
            <span className="text-amber-600 font-bold">Database</span>
          </div>
        </div>

        {/* CARD 4: DOWNLOADS & SHARES */}
        <div className="bg-card rounded-2xl p-5 space-y-3 border border-border-custom/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-600 flex items-center justify-center">
                <Download size={16} />
              </div>
              <span className="font-extrabold text-xs text-main">Ekspor PNG</span>
            </div>
            <div className="w-6 h-6 rounded-full bg-purple-500/10 text-purple-600 flex items-center justify-center">
              <ArrowUpRight size={13} />
            </div>
          </div>

          <div className="bg-purple-600 text-white rounded-xl p-4 flex items-center justify-between">
            <div>
              <span className="text-[9px] font-extrabold uppercase tracking-wider opacity-85 block">Total Unduh / Bagikan</span>
              <span className="text-2xl font-extrabold mt-0.5 block">
                {formatNumber((analytics?.summary.totalDownloads || 0) + (analytics?.summary.totalShares || 0))}
              </span>
            </div>
            <Download size={24} className="opacity-90" />
          </div>

          <div className="flex items-center justify-between text-[10px] font-semibold text-muted pt-0.5">
            <span>Unduh: {analytics?.summary.totalDownloads || 0}</span>
            <span>Bagikan: {analytics?.summary.totalShares || 0}</span>
          </div>
        </div>
      </div>

      {/* TRAFFIC & ACTION DETAILS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card rounded-3xl p-6">
          <h3 className="font-extrabold text-sm tracking-tight  pb-4 mb-4 text-main">
            Sumber Trafik Masuk (Referrer)
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className=" text-muted font-bold">
                  <th className="py-2.5">Sumber / Rujukan</th>
                  <th className="py-2.5 text-right">Jumlah Kunjungan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-custom/50">
                {analytics?.referrers.map((ref, idx) => (
                  <tr key={idx} className="hover:bg-sub-slate/30 text-main">
                    <td className="py-3 font-semibold">{ref.name}</td>
                    <td className="py-3 text-right font-bold">{formatNumber(ref.value)}</td>
                  </tr>
                ))}
                {(!analytics?.referrers || analytics.referrers.length === 0) && (
                  <tr>
                    <td colSpan={2} className="py-6 text-center text-muted font-semibold">
                      Belum ada data kunjungan.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-card rounded-3xl p-6">
          <h3 className="font-extrabold text-sm tracking-tight  pb-4 mb-4 text-main">
            Aktivitas per Kalkulator
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className=" text-muted font-bold">
                  <th className="py-2.5">Jenis Kalkulator</th>
                  <th className="py-2.5 text-center">Unduh PNG</th>
                  <th className="py-2.5 text-center">Bagikan PNG</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-custom/50 text-main">
                <tr className="hover:bg-sub-slate/30">
                  <td className="py-3 font-semibold">ARA / ARB Limit</td>
                  <td className="py-3 text-center font-bold text-acc-green">
                    {analytics?.calculatorStats['ara-arb']?.download || 0}
                  </td>
                  <td className="py-3 text-center font-bold text-acc-blue">
                    {analytics?.calculatorStats['ara-arb']?.share || 0}
                  </td>
                </tr>
                <tr className="hover:bg-sub-slate/30">
                  <td className="py-3 font-semibold">Average Up/Down</td>
                  <td className="py-3 text-center font-bold text-acc-green">
                    {analytics?.calculatorStats['average']?.download || 0}
                  </td>
                  <td className="py-3 text-center font-bold text-acc-blue">
                    {analytics?.calculatorStats['average']?.share || 0}
                  </td>
                </tr>
                <tr className="hover:bg-sub-slate/30">
                  <td className="py-3 font-semibold">Prediksi Jual/Beli</td>
                  <td className="py-3 text-center font-bold text-acc-green">
                    {analytics?.calculatorStats['prediction']?.download || 0}
                  </td>
                  <td className="py-3 text-center font-bold text-acc-blue">
                    {analytics?.calculatorStats['prediction']?.share || 0}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Log Aktivitas Terbaru */}
      <div className="bg-card rounded-3xl p-6">
        <h3 className="font-extrabold text-sm tracking-tight  pb-4 mb-4 text-main">
          Log Aktivitas Pengguna Terbaru (Download / Share)
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className=" text-muted font-bold">
                <th className="py-2.5">Waktu</th>
                <th className="py-2.5">Kalkulator</th>
                <th className="py-2.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-custom/50 text-main">
              {analytics?.recentActions.map((log) => (
                <tr key={log.id} className="hover:bg-sub-slate/30">
                  <td className="py-3 text-muted">
                    {new Date(log.timestamp).toLocaleString('id-ID')}
                  </td>
                  <td className="py-3 font-semibold">
                    {log.calculatorType === 'ara-arb'
                      ? 'ARA / ARB Limit'
                      : log.calculatorType === 'average'
                      ? 'Average Up/Down'
                      : 'Prediksi Jual/Beli'}
                  </td>
                  <td className="py-3 text-right">
                    <span
                      className={`inline-block text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border ${
                        log.action === 'download'
                          ? 'bg-sub-green border-acc-green/20 text-acc-green'
                          : 'bg-sub-blue border-acc-blue/20 text-acc-blue'
                      }`}
                    >
                      {log.action}
                    </span>
                  </td>
                </tr>
              ))}
              {(!analytics?.recentActions || analytics.recentActions.length === 0) && (
                <tr>
                  <td colSpan={3} className="py-6 text-center text-muted font-semibold">
                    Belum ada log aktivitas.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
