'use client';

import React, { useState } from 'react';
import { ShieldAlert, TrendingUp, TrendingDown, HelpCircle, Calculator } from 'lucide-react';
import { Board, calculateAraArb } from '@/features/calculators';
import { formatIDR } from '@/lib/utils/formatters';
import type { FractionRule } from '@/types';
import ExportCardWrapper from '@/components/ui/ExportCardWrapper';

interface Props {
  fractionRules?: FractionRule[];
}

export default function LandingTwoAraArbCalculator({ fractionRules }: Props) {
  const [ticker, setTicker] = useState<string>('BBRI');
  const [price, setPrice] = useState<number>(2110);
  const [board, setBoard] = useState<Board>('Utama');
  const [hasCalculated, setHasCalculated] = useState<boolean>(false);

  const result = calculateAraArb(price, board, fractionRules);

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
      const el = document.getElementById('landing2-ara-arb-result');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }, 50);
  };

  const cleanFileName = ticker
    ? `kalkulator-ara-arb-${ticker}-${price}`
    : `kalkulator-ara-arb-${price}`;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 items-start gap-8">
      {/* Left Form Input Card */}
      <div className="flex flex-col justify-between space-y-5">
        <div>
          <div className="flex items-center justify-between pb-3 border-b border-slate-200/80 mb-5">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-md flex items-center justify-center bg-slate-900 text-white">
                <ShieldAlert size={16} />
              </div>
              <span className="font-bold text-slate-900 text-sm">Parameter Penutupan</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="space-y-1">
              <label htmlFor="landing2-ara-ticker" className="text-[11px] font-bold text-slate-500 block">
                Ticker (A-Z)
              </label>
              <input
                id="landing2-ara-ticker"
                type="text"
                className="w-full h-10 bg-white rounded-lg px-3 py-2 text-sm text-slate-900 font-bold outline-none focus:ring-1 focus:ring-slate-900 border border-slate-200 uppercase transition-all placeholder-slate-400"
                value={ticker}
                onChange={handleTickerChange}
                placeholder="BBRI"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="landing2-ara-board" className="text-[11px] font-bold text-slate-500 block">
                Papan Saham
              </label>
              <select
                id="landing2-ara-board"
                className="w-full h-10 bg-white rounded-lg px-3 py-2 text-sm text-slate-900 font-semibold outline-none focus:ring-1 focus:ring-slate-900 border border-slate-200 cursor-pointer transition-all"
                value={board}
                onChange={(e) => setBoard(e.target.value as Board)}
              >
                <option value="Utama">Utama / Pengembangan</option>
                <option value="Akselerasi">Akselerasi</option>
                <option value="Watchlist">Watchlist (FTS)</option>
              </select>
            </div>
          </div>

          <div className="space-y-1 mb-5">
            <label htmlFor="landing2-ara-price" className="text-[11px] font-bold text-slate-500 block">
              Harga Penutupan Kemarin
            </label>
            <input
              id="landing2-ara-price"
              type="text"
              inputMode="numeric"
              className="w-full h-10 bg-white rounded-lg px-3 py-2 text-sm text-slate-900 font-semibold outline-none focus:ring-1 focus:ring-slate-900 border border-slate-200 transition-all"
              value={price ? new Intl.NumberFormat('id-ID').format(price) : ''}
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
            <span>Hitung Batas ARA &amp; ARB</span>
          </button>
        </div>

        <div className="bg-slate-100 border border-slate-200/80 text-slate-700 rounded-xl p-3.5 space-y-1 text-xs">
          <div className="flex items-center gap-1.5 font-bold text-slate-900">
            <HelpCircle size={14} /> Aturan Pembulatan Fraksi:
          </div>
          <span className="text-slate-600 text-[11px] leading-relaxed block">
            ARA dibulatkan ke bawah (Math.floor) ke tick terdekat untuk mencegah harga melebihi batas persentase maksimal. ARB dibulatkan ke atas (Math.ceil).
          </span>
        </div>
      </div>

      {/* Right Output Card (Hidden on mobile until Hitung is clicked) */}
      <div
        id="landing2-ara-arb-result"
        className={`w-full transition-all duration-300 ${hasCalculated ? 'block' : 'hidden lg:block'}`}
      >
        <ExportCardWrapper fileName={cleanFileName} calculatorType="ara-arb" embedded>
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 mb-5">
            <div className="bg-[#ecfdf5] rounded-xl p-3.5 space-y-1">
              <span className="text-[10px] font-extrabold uppercase tracking-wider block text-[#047857]">Persentase ARA</span>
              <span className="text-sm font-extrabold block text-[#065f46] wrap-break-word">+{result.araPercent.toFixed(2)}%</span>
            </div>
            <div className="bg-[#f8fafc] rounded-xl p-3.5 space-y-1">
              <span className="text-[10px] font-extrabold uppercase tracking-wider block text-[#475569] leading-tight">Harga Mentah ARA</span>
              <span className="text-sm font-extrabold block text-[#0f172a] wrap-break-word">{formatIDR(result.araRaw)}</span>
            </div>
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
            <div className="bg-[#fff1f2] rounded-xl p-3.5 space-y-1">
              <span className="text-[10px] font-extrabold uppercase tracking-wider block text-[#be123c]">Persentase ARB</span>
              <span className="text-sm font-extrabold block text-[#9f1239] wrap-break-word">-${Math.abs(result.arbPercent).toFixed(2)}%</span>
            </div>
            <div className="bg-[#f8fafc] rounded-xl p-3.5 space-y-1">
              <span className="text-[10px] font-extrabold uppercase tracking-wider block text-[#475569] leading-tight">Harga Mentah ARB</span>
              <span className="text-sm font-extrabold block text-[#0f172a] wrap-break-word">{formatIDR(result.arbRaw)}</span>
            </div>
          </div>
        </ExportCardWrapper>
      </div>
    </div>
  );
}
