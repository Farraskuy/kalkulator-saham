'use client';

import React, { useState } from 'react';
import { ShieldAlert, TrendingUp, TrendingDown, HelpCircle, Calculator, RotateCcw, Calendar } from 'lucide-react';
import { Board, calculateAraArb } from '@/features/calculators';
import { formatIDR, formatPercent, formatNumber } from '@/lib/utils/formatters';
import type { AraArbRuleMap, FractionRule } from '@/types';
import ExportCardWrapper from '@/components/ui/ExportCardWrapper';

interface Props {
  fractionRules?: FractionRule[];
  araArbRules?: AraArbRuleMap;
}

export default function LandingAraArbCalculator({ fractionRules, araArbRules }: Props) {
  const [ticker, setTicker] = useState<string>('');
  const [price, setPrice] = useState<number>(0);
  const [board, setBoard] = useState<Board>('Utama');
  const [hasCalculated, setHasCalculated] = useState<boolean>(false);
  const [domainName, setDomainName] = useState<string>('HitungSaham.com');

  React.useEffect(() => {
    if (typeof window !== 'undefined' && window.location.hostname) {
      setDomainName(window.location.hostname);
    }
  }, []);

  const result = calculateAraArb(price, board, fractionRules, araArbRules);

  const handleTickerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const cleanTicker = e.target.value.replace(/[^a-zA-Z]/g, '').slice(0, 4).toUpperCase();
    setTicker(cleanTicker);
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value.replace(/\D/g, '');
    setPrice(rawVal ? parseInt(rawVal, 10) : 0);
  };

  const handleCalculate = () => {
    setHasCalculated(true);
    setTimeout(() => {
      const el = document.getElementById('ara-arb-result');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }, 50);
  };

  const handleReset = () => {
    setTicker('');
    setPrice(0);
    setBoard('Utama');
    setHasCalculated(false);
  };

  const cleanFileName = (() => {
    const domain = domainName.toLowerCase();
    const type = 'ARA-ARB';
    const tickerVal = ticker ? ticker.toUpperCase() : 'NO-TICKER';
    const priceVal = price || 0;
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const dateStr = `${yyyy}${mm}${dd}`;
    return `${domain}-${type}-${tickerVal}-${priceVal}-${dateStr}`;
  })();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 items-start gap-8">
      {/* Left Form Input Card */}
      <div className="flex flex-col justify-between space-y-5">
        <div>
          <div className="flex items-center justify-between pb-3 border-b border-border-custom/80 mb-5">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-md flex items-center justify-center bg-slate-900 text-white">
                <ShieldAlert size={16} />
              </div>
              <span className="font-bold text-main text-sm">Parameter Penutupan</span>
            </div>
            <button type="button" onClick={handleReset} className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-bold text-muted transition-colors hover:bg-sub-slate hover:text-main" title="Reset kalkulator">
              <RotateCcw size={13} /> Reset
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="space-y-1">
              <label htmlFor="ara-ticker" className="text-[11px] font-bold text-muted block">
                Kode Saham
              </label>
              <input
                id="ara-ticker"
                type="text"
                className="w-full h-10 bg-card rounded-lg px-3 py-2 text-sm text-main font-bold outline-none focus:ring-1 focus:ring-acc-blue border border-border-custom uppercase transition-all placeholder:text-muted"
                value={ticker}
                onChange={handleTickerChange}
                placeholder="BBRI"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="ara-board" className="text-[11px] font-bold text-muted block">
                Papan Saham
              </label>
              <select
                id="ara-board"
                className="w-full h-10 bg-card rounded-lg px-3 py-2 text-sm text-main font-semibold outline-none focus:ring-1 focus:ring-acc-blue border border-border-custom cursor-pointer transition-all"
                value={board}
                onChange={(e) => setBoard(e.target.value as Board)}
              >
                <option value="" disabled>Pilih papan saham</option>
                <option value="Utama">Utama / Pengembangan</option>
                <option value="Akselerasi">Akselerasi</option>
                <option value="FCA">FCA</option>
              </select>
            </div>
          </div>

          <div className="space-y-1 mb-5">
            <label htmlFor="ara-price" className="text-[11px] font-bold text-muted block">
              Harga Penutupan Kemarin
            </label>
            <input
              id="ara-price"
              type="text"
              inputMode="numeric"
              className="w-full h-10 bg-card rounded-lg px-3 py-2 text-sm text-main font-semibold outline-none focus:ring-1 focus:ring-acc-blue border border-border-custom transition-all"
              value={price ? formatNumber(price) : ''}
              onChange={handlePriceChange}
              placeholder="e.g. 2.110"
            />
          </div>

          {/* Hitung Button for Mobile & Responsive */}
          <button
            type="button"
            onClick={handleCalculate}
            className="w-full h-11 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm mb-4"
          >
            <Calculator size={16} />
            <span>Hitung</span>
          </button>
        </div>

        <div className="bg-sub-slate border border-border-custom text-sub rounded-xl p-3.5 space-y-1 text-xs">
          <div className="flex items-center gap-1.5 font-bold text-main">
            <HelpCircle size={14} /> Aturan Pembulatan Fraksi:
          </div>
          <span className="text-sub text-[11px] leading-relaxed block">
            Menghitung batas untuk satu sesi perdagangan dari harga previous. ARA dibulatkan ke bawah dan ARB ke atas sesuai fraksi harga agar tidak melewati batas maksimum; harga minimum papan ini adalah Rp50.
          </span>
        </div>
      </div>

      {/* Right Output Card (Hidden on mobile until Hitung is clicked) */}
      <div
        id="ara-arb-result"
        className={`w-full transition-all duration-300 ${hasCalculated ? 'block' : 'hidden lg:block'}`}
      >
        <ExportCardWrapper fileName={cleanFileName} calculatorType="ara-arb" embedded>
          <div className="flex justify-between items-start border-b border-border-custom/30 pb-3 mb-4 text-main">
            {/* Left Side: Ticker */}
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold tracking-tight uppercase">
                {ticker}
              </div>
            </div>
            {/* Right Side: Date */}
            <div className="text-[10px] font-medium text-muted space-y-1 text-right">
              <div className="flex items-center justify-end gap-1.5">
                <Calendar size={12} className="text-muted/80" />
                <span>{new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
              </div>
            </div>
          </div>
          {/* ARA Box (Solid Emerald, No Gradient, No Shadow, No Border) */}
          <div className="bg-[#059669] text-white rounded-xl p-4 flex items-center justify-between">
            <div>
              <div className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-100">Batas Auto Rejection Atas (ARA)</div>
              <div className="text-xl sm:text-2xl font-extrabold mt-1 text-white">{formatIDR(result.ara)}</div>
            </div>
            <div className="text-white opacity-95">
              <TrendingUp size={24} />
            </div>
          </div>

          <div className="mt-4 mb-4">
            <div className="bg-emerald-500/10 rounded-xl p-3.5 space-y-1">
              <span className="text-[10px] font-extrabold uppercase tracking-wider block text-emerald-700 dark:text-emerald-400">Persentase ARA</span>
              <span className="text-sm font-extrabold block text-emerald-800 dark:text-emerald-300 wrap-break-word">+{formatPercent(result.araPercent)}</span>
            </div>
          </div>

          <div className="border-y border-border-custom/30 py-1 text-[10px] font-medium text-muted text-center">
            {domainName}
          </div>

          {/* ARB Box (Solid Rose, No Gradient, No Shadow, No Border) */}
          <div className="bg-[#e11d48] text-white rounded-xl p-4 flex items-center justify-between gap-3">
            <div>
              <div className="text-[10px] font-extrabold uppercase tracking-wider text-rose-100">Batas Auto Rejection Bawah (ARB)</div>
              <div className="text-lg sm:text-2xl font-extrabold mt-1 text-white wrap-break-word">{formatIDR(result.arb)}</div>
            </div>
            <div className="shrink-0 text-white opacity-95">
              <TrendingDown size={24} />
            </div>
          </div>

          <div className="mt-4">
            <div className="bg-rose-500/10 rounded-xl p-3.5 space-y-1">
              <span className="text-[10px] font-extrabold uppercase tracking-wider block text-rose-700 dark:text-rose-400">Persentase ARB</span>
              <span className="text-sm font-extrabold block text-rose-800 dark:text-rose-300 wrap-break-word">-{formatPercent(Math.abs(result.arbPercent))}</span>
            </div>
          </div>
        </ExportCardWrapper>
      </div>
    </div>
  );
}
