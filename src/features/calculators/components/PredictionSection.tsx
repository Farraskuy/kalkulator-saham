'use client';

import React, { useState } from 'react';
import { Target, TrendingUp, TrendingDown, Calculator, Coins } from 'lucide-react';
import { kalkulasiTargetSaham, formatIDR, formatNumber } from '@/features/calculators/services/calculations';
import { FractionRule } from '@/types';
import ExportCardWrapper from '@/components/ui/ExportCardWrapper';

interface Props {
  fractionRules?: FractionRule[];
  tax?: number;
}

export default function PredictionSection({ fractionRules, tax = 0.0 }: Props) {
  const [ticker, setTicker] = useState<string>('BBRI');
  const [clientName, setClientName] = useState<string>('');
  const [hargaBeli, setHargaBeli] = useState<number>(1000);
  const [lot, setLot] = useState<number>(10);
  const [feeBeli, setFeeBeli] = useState<number>(0.15); // 0.15%
  const [feeJual, setFeeJual] = useState<number>(0.25); // 0.25%
  const [targetUntungRp, setTargetUntungRp] = useState<number>(250000);
  const [targetRugiRp, setTargetRugiRp] = useState<number>(100000);
  const [showMobileResult, setShowMobileResult] = useState(false);

  const result = kalkulasiTargetSaham(
    {
      hargaBeli,
      lot,
      feeBeli,
      feeJual,
      targetUntungRp,
      targetRugiRp,
      pajak: tax,
    },
    fractionRules
  );

  const handleTickerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const cleanTicker = e.target.value.replace(/[^a-zA-Z]/g, '').slice(0, 4).toUpperCase();
    setTicker(cleanTicker);
  };

  const handleNumChange = (setter: (val: number) => void) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value.replace(/\D/g, '');
    setter(rawVal ? parseInt(rawVal, 10) : 0);
  };

  const cleanFileName = clientName 
    ? `kalkulator-prediksi-${ticker}-${clientName.replace(/\s+/g, '-')}` 
    : `kalkulator-prediksi-${ticker}`;

  return (
    <section id="prediction" className="space-y-6 scroll-mt-20">
      <div className="pb-4 px-4 sm:px-0">
        <h2 className="text-xl sm:text-2xl font-extrabold flex items-center gap-2.5 text-main mt-1">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white bg-acc-green shadow-acc-green/20">
            <Target size={20} />
          </div>
          Prediksi Jual / Beli & Target Untung Rugi
        </h2>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-muted">
          Estimasikan harga jual minimum untuk target profit dan harga stop loss untuk batas kerugian, termasuk fee beli, fee jual, pajak, serta fraksi harga bursa.
        </p>
        <div className="mt-3 inline-flex rounded-xl bg-sub-green px-3 py-2 text-xs font-semibold text-acc-green">
          Rumus: profit/rugi bersih = hasil jual setelah fee dikurangi total modal setelah fee beli.
        </div>
      </div>

      <div className="overflow-hidden rounded-none sm:rounded-2xl bg-card border-0 sm:border border-border-custom/50">
        <div className="grid grid-cols-1 lg:grid-cols-2 items-start">
          {/* Left Form Card */}
          <div className="p-6 sm:p-8 flex flex-col justify-between min-h-[420px]">
            <div>
              <div className="flex items-center justify-between pb-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-sub-green text-acc-green">
                    <Target size={18} />
                  </div>
                  <span className="font-bold text-main">Parameter Target &amp; Fee</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="space-y-1.5">
                  <label htmlFor="pred-ticker" className="text-[11px] font-bold text-muted block min-h-4 leading-tight">
                    Ticker (A-Z)
                  </label>
                  <input
                    id="pred-ticker"
                    type="text"
                    className="w-full h-10 bg-sub-slate/60 rounded-lg px-3 py-2 text-sm text-main font-bold outline-none focus:ring-1 focus:ring-acc-green transition-all uppercase placeholder-gray-400 border-0"
                    value={ticker}
                    onChange={handleTickerChange}
                    placeholder="BBRI"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="pred-name" className="text-[11px] font-bold text-muted block min-h-4 leading-tight">
                    Nama (Opsional)
                  </label>
                  <input
                    id="pred-name"
                    type="text"
                    className="w-full h-10 bg-sub-slate/60 rounded-lg px-3 py-2 text-sm text-main font-semibold outline-none focus:ring-1 focus:ring-acc-green transition-all placeholder-gray-400 border-0"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="e.g. Budi"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="space-y-1.5">
                  <label htmlFor="pred-price" className="text-[11px] font-bold text-muted block min-h-4 leading-tight">
                    Harga Beli (Rp)
                  </label>
                  <input
                    id="pred-price"
                    type="text"
                    inputMode="numeric"
                    className="w-full h-10 bg-sub-slate/60 rounded-lg px-3 py-2 text-sm text-main font-semibold outline-none focus:ring-1 focus:ring-acc-green transition-all border-0"
                    value={hargaBeli ? formatNumber(hargaBeli) : ''}
                    onChange={handleNumChange(setHargaBeli)}
                    placeholder="e.g. 1.000"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="pred-lot" className="text-[11px] font-bold text-muted block min-h-4 leading-tight">
                    Jumlah Lot
                  </label>
                  <input
                    id="pred-lot"
                    type="text"
                    inputMode="numeric"
                    className="w-full h-10 bg-sub-slate/60 rounded-lg px-3 py-2 text-sm text-main font-semibold outline-none focus:ring-1 focus:ring-acc-green transition-all border-0"
                    value={lot ? formatNumber(lot) : ''}
                    onChange={handleNumChange(setLot)}
                    placeholder="e.g. 10"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="space-y-1.5">
                  <label htmlFor="pred-feebeli" className="text-[11px] font-bold text-muted block min-h-4 leading-tight">
                    Fee Beli (%)
                  </label>
                  <input
                    id="pred-feebeli"
                    type="number"
                    step="0.01"
                    className="w-full h-10 bg-sub-slate/60 rounded-lg px-3 py-2 text-sm text-main font-semibold outline-none focus:ring-1 focus:ring-acc-green transition-all border-0"
                    value={feeBeli}
                    onChange={(e) => setFeeBeli(parseFloat(e.target.value) || 0)}
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="pred-feejual" className="text-[11px] font-bold text-muted block min-h-4 leading-tight">
                    Fee Jual (%)
                  </label>
                  <input
                    id="pred-feejual"
                    type="number"
                    step="0.01"
                    className="w-full h-10 bg-sub-slate/60 rounded-lg px-3 py-2 text-sm text-main font-semibold outline-none focus:ring-1 focus:ring-acc-green transition-all border-0"
                    value={feeJual}
                    onChange={(e) => setFeeJual(parseFloat(e.target.value) || 0)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label htmlFor="pred-profit" className="text-[11px] font-bold text-muted block min-h-4 leading-tight">
                    Target Untung (Rp)
                  </label>
                  <input
                    id="pred-profit"
                    type="text"
                    inputMode="numeric"
                    className="w-full h-10 bg-sub-slate/60 rounded-lg px-3 py-2 text-sm text-main font-semibold outline-none focus:ring-1 focus:ring-acc-green transition-all border-0"
                    value={targetUntungRp ? formatNumber(targetUntungRp) : ''}
                    onChange={handleNumChange(setTargetUntungRp)}
                    placeholder="e.g. 250.000"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="pred-loss" className="text-[11px] font-bold text-muted block min-h-4 leading-tight">
                    Batas Rugi (Rp)
                  </label>
                  <input
                    id="pred-loss"
                    type="text"
                    inputMode="numeric"
                    className="w-full h-10 bg-sub-slate/60 rounded-lg px-3 py-2 text-sm text-main font-semibold outline-none focus:ring-1 focus:ring-acc-green transition-all border-0"
                    value={targetRugiRp ? formatNumber(targetRugiRp) : ''}
                    onChange={handleNumChange(setTargetRugiRp)}
                    placeholder="e.g. 100.000"
                  />
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setShowMobileResult(true);
                setTimeout(() => document.getElementById('prediction-result')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 0);
              }}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-acc-green px-5 py-3 text-sm font-bold text-white lg:hidden"
            >
              <Calculator size={18} /> Hitung &amp; Tampilkan Hasil
            </button>
          </div>

          {/* Right Output Card */}
          <div id="prediction-result" className={`${showMobileResult ? 'block' : 'hidden'} scroll-mt-20 border-t border-border-custom/50 p-6 sm:p-8 lg:block lg:border-l lg:border-t-0`}>
            <ExportCardWrapper fileName={cleanFileName} calculatorType="prediction" embedded>
              {/* Total Modal Banner */}
              <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white rounded-xl p-4 flex items-center justify-between gap-3 overflow-hidden">
                <div className="min-w-0">
                  <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-300">Total Modal (+ Fee Beli)</div>
                  <div className="text-base sm:text-2xl font-extrabold mt-1 text-white break-words">{formatIDR(result.rincian.totalModal)}</div>
                </div>
                <div className="shrink-0 opacity-90">
                  <Coins size={24} />
                </div>
              </div>

              {/* Skenario Untung Box */}
              <div className="bg-sub-green rounded-xl p-3.5 sm:p-4 mt-4 mb-3">
                <div className="flex items-start justify-between mb-3 gap-2 pb-2 border-b border-acc-green/10">
                  <div className="flex items-start gap-1.5 font-bold text-xs text-acc-green min-w-0 pr-2">
                    <TrendingUp size={16} className="shrink-0 mt-0.5" />
                    <span className="leading-tight break-words">TARGET UNTUNG (TAKE PROFIT)</span>
                  </div>
                  <span className="shrink-0 font-bold text-acc-green text-xs sm:text-sm bg-acc-green/10 px-2 py-0.5 rounded-md whitespace-nowrap">
                    +{result.skenarioUntung.persentase}%
                  </span>
                </div>

                <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 gap-3">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider block text-muted">Harga Jual Fraksi</span>
                    <div className="text-sm sm:text-base font-extrabold text-main break-words">
                      {formatIDR(result.skenarioUntung.hargaBEI)}
                    </div>
                    <div className="text-[10px] text-muted mt-0.5 break-words">
                      Harga Exact: {formatIDR(result.skenarioUntung.hargaExact)}
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider block text-muted">Profit Bersih</span>
                    <div className="text-sm sm:text-base font-extrabold text-acc-green break-words">
                      +{formatIDR(result.skenarioUntung.labaBersihReal)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Skenario Rugi Box */}
              <div className="bg-sub-pink rounded-xl p-3.5 sm:p-4">
                <div className="flex items-start justify-between mb-3 gap-2 pb-2 border-b border-acc-pink/10">
                  <div className="flex items-start gap-1.5 font-bold text-xs text-acc-pink min-w-0 pr-2">
                    <TrendingDown size={16} className="shrink-0 mt-0.5" />
                    <span className="leading-tight break-words">BATAS RUGI (STOP LOSS)</span>
                  </div>
                  <div className="shrink-0 font-bold text-acc-pink text-xs sm:text-sm bg-acc-pink/10 px-2 py-0.5 rounded-md whitespace-nowrap">
                    -{result.skenarioRugi.persentase}%
                  </div>
                </div>

                <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 gap-3">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider block text-muted">Harga Jual Fraksi</span>
                    <div className="text-sm sm:text-base font-extrabold text-main break-words">
                      {formatIDR(result.skenarioRugi.hargaBEI)}
                    </div>
                    <div className="text-[10px] text-muted mt-0.5 break-words">
                      Harga Exact: {formatIDR(result.skenarioRugi.hargaExact)}
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider block text-muted">Rugi Bersih</span>
                    <div className="text-sm sm:text-base font-extrabold text-acc-pink break-words">
                      -{formatIDR(result.skenarioRugi.rugiBersihReal)}
                    </div>
                  </div>
                </div>
              </div>
            </ExportCardWrapper>
          </div>
        </div>
      </div>
    </section>
  );
}
