'use client';

import React, { useState } from 'react';
import { ShieldAlert, TrendingUp, TrendingDown, HelpCircle, Calculator } from 'lucide-react';
import { Board, calculateAraArb, formatIDR } from '@/features/calculators/services/calculations';
import { FractionRule } from '@/types';
import ExportCardWrapper from '@/components/ui/ExportCardWrapper';

interface Props {
  fractionRules?: FractionRule[];
}

export default function AraArbSection({ fractionRules }: Props) {
  const [ticker, setTicker] = useState<string>('BBRI');
  const [price, setPrice] = useState<number>(2110);
  const [board, setBoard] = useState<Board>('Utama');
  const [showMobileResult, setShowMobileResult] = useState(false);

  const result = calculateAraArb(price, board, fractionRules);

  const saveHistory = async () => {
    if (!price) return;
    try {
      await fetch('/api/history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          calculatorType: 'ara-arb',
          title: ticker ? `${ticker} - Rp ${price.toLocaleString('id-ID')}` : `Rp ${price.toLocaleString('id-ID')}`,
          inputs: { ticker, price, board },
          results: { ara: result.ara, arb: result.arb, araPercent: result.araPercent, arbPercent: result.arbPercent },
        }),
      });
    } catch {
      // ignore
    }
  };

  const handleTickerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const cleanTicker = e.target.value.replace(/[^a-zA-Z]/g, '').slice(0, 4).toUpperCase();
    setTicker(cleanTicker);
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value.replace(/\D/g, '');
    setPrice(rawVal ? parseInt(rawVal, 10) : 0);
  };

  const cleanFileName = ticker
    ? `kalkulator-ara-arb-${ticker}-${price}`
    : `kalkulator-ara-arb-${price}`;

  return (
    <section id="ara-arb" className="space-y-6 scroll-mt-20">
      <div className="pb-4 px-4 sm:px-0">
        <h2 className="text-xl sm:text-2xl font-extrabold flex items-center gap-2.5 text-main mt-1">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white bg-acc-blue shadow-acc-blue/20">
            <ShieldAlert size={20} />
          </div>
          Batas Auto Rejection (ARA / ARB)
        </h2>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-muted">
          Cari harga tertinggi dan terendah yang dapat diperdagangkan pada sesi berikutnya berdasarkan harga penutupan, papan pencatatan, dan fraksi harga BEI.
        </p>
        <div className="mt-3 inline-flex rounded-xl bg-sub-blue px-3 py-2 text-xs font-semibold text-acc-blue">
          Rumus: harga penutupan x (1 +/- batas auto rejection), lalu disesuaikan ke fraksi harga.
        </div>
      </div>

      <div className="overflow-hidden rounded-none sm:rounded-2xl bg-card border-0 sm:border border-border-custom/50">
        <div className="grid grid-cols-1 lg:grid-cols-2 items-start">
          {/* Left Form Input Card */}
          <div className="p-6 sm:p-8 flex flex-col justify-between min-h-[420px]">
            <div>
              <div className="flex items-center justify-between pb-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-sub-blue text-acc-blue">
                    <ShieldAlert size={18} />
                  </div>
                  <span className="font-bold text-main">Parameter Penutupan</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="space-y-1.5">
                  <label htmlFor="ara-ticker" className="text-[11px] font-bold text-muted block min-h-4 leading-tight">
                    Ticker (A-Z)
                  </label>
                  <input
                    id="ara-ticker"
                    type="text"
                    className="w-full h-10 bg-sub-slate/60 rounded-lg px-3 py-2 text-sm text-main font-bold outline-none focus:ring-1 focus:ring-acc-blue transition-all uppercase placeholder-gray-400 border-0"
                    value={ticker}
                    onChange={handleTickerChange}
                    placeholder="BBRI"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="ara-board" className="text-[11px] font-bold text-muted block min-h-4 leading-tight">
                    Papan Saham
                  </label>
                  <select
                    id="ara-board"
                    className="w-full h-10 bg-sub-slate/60 rounded-lg px-3 py-2 text-sm text-main font-semibold outline-none focus:ring-1 focus:ring-acc-blue transition-all cursor-pointer border-0"
                    value={board}
                    onChange={(e) => setBoard(e.target.value as Board)}
                  >
                    <option value="Utama">Utama / Pengembangan</option>
                    <option value="Akselerasi">Akselerasi</option>
                    <option value="Watchlist">Watchlist (FTS)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5 mb-4">
                <label htmlFor="ara-price" className="text-[11px] font-bold text-muted block min-h-4 leading-tight">
                  Harga Penutupan Kemarin
                </label>
                <input
                  id="ara-price"
                  type="text"
                  inputMode="numeric"
                  className="w-full h-10 bg-sub-slate/60 rounded-lg px-3 py-2 text-sm text-main font-semibold outline-none focus:ring-1 focus:ring-acc-blue transition-all border-0"
                  value={price ? new Intl.NumberFormat('id-ID').format(price) : ''}
                  onChange={handlePriceChange}
                  placeholder="e.g. 2.110"
                />
              </div>
            </div>

            <div className="bg-sub-blue text-acc-blue rounded-xl p-3.5 space-y-1 mt-4 text-xs">
              <div className="flex items-center gap-1.5 font-bold">
                <HelpCircle size={15} /> Aturan Pembulatan BEI:
              </div>
              <span className="text-sub text-[11px] leading-relaxed block">
                ARA dibulatkan ke bawah (Math.floor) ke tick terdekat untuk mencegah harga melebihi batas persentase maksimal. ARB dibulatkan ke atas (Math.ceil) agar penurunan tidak melewati batas maksimal.
              </span>
            </div>
            <button
              type="button"
              onClick={() => {
                saveHistory();
                setShowMobileResult(true);
                setTimeout(() => document.getElementById('ara-arb-result')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 0);
              }}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-acc-blue px-5 py-3 text-sm font-bold text-white lg:hidden"
            >
              <Calculator size={18} /> Hitung &amp; Tampilkan Hasil
            </button>
          </div>

          {/* Right Output Card */}
          <div id="ara-arb-result" className={`${showMobileResult ? 'block' : 'hidden'} scroll-mt-20 border-t border-border-custom p-6 sm:p-8 lg:block lg:border-l lg:border-t-0`}>
            <ExportCardWrapper fileName={cleanFileName} calculatorType="ara-arb" embedded>
              {/* ARA Box */}
              <div className="bg-gradient-to-r from-acc-blue to-acc-blue/90 text-white rounded-xl p-4 flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-extrabold uppercase tracking-wider opacity-85">Batas Auto Rejection Atas (ARA)</div>
                  <div className="text-xl sm:text-2xl font-extrabold mt-1">{formatIDR(result.ara)}</div>
                </div>
                <div>
                  <TrendingUp size={24} />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mt-4 mb-6">
                <div className="bg-sub-green text-acc-green rounded-xl p-3.5 space-y-1">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider block text-muted">Persentase ARA</span>
                  <span className="text-sm sm:text-base font-extrabold block text-acc-green break-words">+{result.araPercent.toFixed(2)}%</span>
                </div>
                <div className="bg-sub-blue text-acc-blue rounded-xl p-3.5 space-y-1">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider block text-muted leading-tight">Harga Mentah ARA ({result.araLimitLabel})</span>
                  <span className="text-sm sm:text-base font-extrabold block text-main break-words">
                    {formatIDR(result.araRaw)}
                  </span>
                </div>
              </div>

              {/* ARB Box */}
              <div className="bg-gradient-to-r from-acc-pink to-acc-pink/90 text-white rounded-xl p-4 sm:p-5 flex items-center justify-between gap-3">
                <div>
                  <div className="text-[10px] font-extrabold uppercase tracking-wider opacity-85">Batas Auto Rejection Bawah (ARB)</div>
                  <div className="text-lg sm:text-2xl font-extrabold mt-1 break-words">{formatIDR(result.arb)}</div>
                </div>
                <div className="shrink-0">
                  <TrendingDown size={24} />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mt-4">
                <div className="bg-sub-pink text-acc-pink rounded-xl p-3.5 space-y-1">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider block text-muted">Persentase ARB</span>
                  <span className="text-sm sm:text-base font-extrabold block text-acc-red break-words">-{result.arbPercent.toFixed(2)}%</span>
                </div>
                <div className="bg-sub-slate text-sub rounded-xl p-3.5 space-y-1">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider block text-muted leading-tight">Harga Mentah ARB ({result.arbLimitLabel})</span>
                  <span className="text-sm sm:text-base font-extrabold block text-main break-words">
                    {formatIDR(result.arbRaw)}
                  </span>
                </div>
              </div>
            </ExportCardWrapper>
          </div>
        </div>
      </div>
    </section>
  );
}
