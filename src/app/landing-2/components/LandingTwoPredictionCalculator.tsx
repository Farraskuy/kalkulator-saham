'use client';

import React, { useState } from 'react';
import { Target, TrendingUp, TrendingDown, Coins, Calculator } from 'lucide-react';
import { kalkulasiTargetSaham, formatIDR, formatNumber, FractionRule } from '@/lib/calculations';
import ExportCardWrapper from '@/components/ui/ExportCardWrapper';

interface Props {
  fractionRules?: FractionRule[];
  tax?: number;
}

export default function LandingTwoPredictionCalculator({ fractionRules, tax = 0.0 }: Props) {
  const [ticker, setTicker] = useState<string>('BBRI');
  const [clientName, setClientName] = useState<string>('');
  const [hargaBeli, setHargaBeli] = useState<number>(1000);
  const [lot, setLot] = useState<number>(10);
  const [feeBeli, setFeeBeli] = useState<number>(0.15);
  const [feeJual, setFeeJual] = useState<number>(0.25);
  const [targetUntungRp, setTargetUntungRp] = useState<number>(250000);
  const [targetRugiRp, setTargetRugiRp] = useState<number>(100000);
  const [hasCalculated, setHasCalculated] = useState<boolean>(false);

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

  const handleCalculate = () => {
    setHasCalculated(true);
    setTimeout(() => {
      const el = document.getElementById('landing2-prediction-result');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }, 50);
  };

  const cleanFileName = clientName
    ? `kalkulator-prediksi-${ticker}-${clientName.replace(/\s+/g, '-')}`
    : `kalkulator-prediksi-${ticker}`;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 items-start gap-8">
      {/* Left Form Card */}
      <div className="flex flex-col justify-between space-y-4">
        <div>
          <div className="flex items-center justify-between pb-3 border-b border-slate-200/80 mb-5">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-md flex items-center justify-center bg-slate-900 text-white">
                <Target size={16} />
              </div>
              <span className="font-bold text-slate-900 text-sm">Parameter Target &amp; Fee</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="space-y-1">
              <label htmlFor="landing2-pred-ticker" className="text-[11px] font-bold text-slate-500 block">
                Ticker (A-Z)
              </label>
              <input
                id="landing2-pred-ticker"
                type="text"
                className="w-full h-10 bg-white rounded-lg px-3 py-2 text-sm text-slate-900 font-bold outline-none focus:ring-1 focus:ring-slate-900 border border-slate-200 uppercase transition-all placeholder-slate-400"
                value={ticker}
                onChange={handleTickerChange}
                placeholder="BBRI"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="landing2-pred-name" className="text-[11px] font-bold text-slate-500 block">
                Nama (Opsional)
              </label>
              <input
                id="landing2-pred-name"
                type="text"
                className="w-full h-10 bg-white rounded-lg px-3 py-2 text-sm text-slate-900 font-semibold outline-none focus:ring-1 focus:ring-slate-900 border border-slate-200 transition-all placeholder-slate-400"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="e.g. Budi"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="space-y-1">
              <label htmlFor="landing2-pred-price" className="text-[11px] font-bold text-slate-500 block">
                Harga Beli (Rp)
              </label>
              <input
                id="landing2-pred-price"
                type="text"
                inputMode="numeric"
                className="w-full h-10 bg-white rounded-lg px-3 py-2 text-sm text-slate-900 font-semibold outline-none focus:ring-1 focus:ring-slate-900 border border-slate-200 transition-all"
                value={hargaBeli ? formatNumber(hargaBeli) : ''}
                onChange={handleNumChange(setHargaBeli)}
                placeholder="e.g. 1.000"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="landing2-pred-lot" className="text-[11px] font-bold text-slate-500 block">
                Jumlah Lot
              </label>
              <input
                id="landing2-pred-lot"
                type="text"
                inputMode="numeric"
                className="w-full h-10 bg-white rounded-lg px-3 py-2 text-sm text-slate-900 font-semibold outline-none focus:ring-1 focus:ring-slate-900 border border-slate-200 transition-all"
                value={lot ? formatNumber(lot) : ''}
                onChange={handleNumChange(setLot)}
                placeholder="e.g. 10"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="space-y-1">
              <label htmlFor="landing2-pred-feebeli" className="text-[11px] font-bold text-slate-500 block">
                Fee Beli (%)
              </label>
              <input
                id="landing2-pred-feebeli"
                type="number"
                step="0.01"
                className="w-full h-10 bg-white rounded-lg px-3 py-2 text-sm text-slate-900 font-semibold outline-none focus:ring-1 focus:ring-slate-900 border border-slate-200 transition-all"
                value={feeBeli}
                onChange={(e) => setFeeBeli(parseFloat(e.target.value) || 0)}
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="landing2-pred-feejual" className="text-[11px] font-bold text-slate-500 block">
                Fee Jual (%)
              </label>
              <input
                id="landing2-pred-feejual"
                type="number"
                step="0.01"
                className="w-full h-10 bg-white rounded-lg px-3 py-2 text-sm text-slate-900 font-semibold outline-none focus:ring-1 focus:ring-slate-900 border border-slate-200 transition-all"
                value={feeJual}
                onChange={(e) => setFeeJual(parseFloat(e.target.value) || 0)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-5">
            <div className="space-y-1">
              <label htmlFor="landing2-pred-profit" className="text-[11px] font-bold text-slate-500 block">
                Target Untung (Rp)
              </label>
              <input
                id="landing2-pred-profit"
                type="text"
                inputMode="numeric"
                className="w-full h-10 bg-white rounded-lg px-3 py-2 text-sm text-slate-900 font-semibold outline-none focus:ring-1 focus:ring-slate-900 border border-slate-200 transition-all"
                value={targetUntungRp ? formatNumber(targetUntungRp) : ''}
                onChange={handleNumChange(setTargetUntungRp)}
                placeholder="e.g. 250.000"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="landing2-pred-loss" className="text-[11px] font-bold text-slate-500 block">
                Batas Rugi (Rp)
              </label>
              <input
                id="landing2-pred-loss"
                type="text"
                inputMode="numeric"
                className="w-full h-10 bg-white rounded-lg px-3 py-2 text-sm text-slate-900 font-semibold outline-none focus:ring-1 focus:ring-slate-900 border border-slate-200 transition-all"
                value={targetRugiRp ? formatNumber(targetRugiRp) : ''}
                onChange={handleNumChange(setTargetRugiRp)}
                placeholder="e.g. 100.000"
              />
            </div>
          </div>

          {/* Hitung Button for Mobile & Responsive */}
          <button
            type="button"
            onClick={handleCalculate}
            className="w-full h-11 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
          >
            <Calculator size={16} />
            <span>Hitung Target &amp; Proyeksi</span>
          </button>
        </div>
      </div>

      {/* Right Output Card (Hidden on mobile until Hitung is clicked) */}
      <div
        id="landing2-prediction-result"
        className={`w-full transition-all duration-300 ${hasCalculated ? 'block' : 'hidden lg:block'}`}
      >
        <ExportCardWrapper fileName={cleanFileName} calculatorType="prediction" embedded>
          {/* Total Modal Banner */}
          <div className="bg-slate-900 text-white rounded-xl p-4 flex items-center justify-between gap-3 shadow-sm">
            <div className="min-w-0">
              <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-300">Total Modal (+ Fee Beli)</div>
              <div className="text-base sm:text-2xl font-extrabold mt-1 text-white wrap-break-word">{formatIDR(result.rincian.totalModal)}</div>
            </div>
            <div className="shrink-0 text-white opacity-90">
              <Coins size={24} />
            </div>
          </div>

          {/* Skenario Untung Box */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 sm:p-4 mt-4 mb-3">
            <div className="flex items-start justify-between mb-3 gap-2 pb-2 border-b border-slate-200">
              <div className="flex items-start gap-1.5 font-bold text-xs text-slate-900 min-w-0 pr-2">
                <TrendingUp size={16} className="shrink-0 mt-0.5 text-emerald-600" />
                <span className="leading-tight wrap-break-word">TARGET UNTUNG (TAKE PROFIT)</span>
              </div>
              <span className="shrink-0 font-bold text-emerald-700 text-xs bg-emerald-100 px-2 py-0.5 rounded-md whitespace-nowrap">
                +{result.skenarioUntung.persentase}%
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider block text-slate-500">Harga Jual BEI</span>
                <div className="text-sm sm:text-base font-extrabold text-slate-900 wrap-break-word">
                  {formatIDR(result.skenarioUntung.hargaBEI)}
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5 wrap-break-word">
                  Harga Exact: {formatIDR(result.skenarioUntung.hargaExact)}
                </div>
              </div>
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider block text-slate-500">Profit Bersih</span>
                <div className="text-sm sm:text-base font-extrabold text-emerald-600 wrap-break-word">
                  +{formatIDR(result.skenarioUntung.labaBersihReal)}
                </div>
              </div>
            </div>
          </div>

          {/* Skenario Rugi Box */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 sm:p-4">
            <div className="flex items-start justify-between mb-3 gap-2 pb-2 border-b border-slate-200">
              <div className="flex items-start gap-1.5 font-bold text-xs text-slate-900 min-w-0 pr-2">
                <TrendingDown size={16} className="shrink-0 mt-0.5 text-red-600" />
                <span className="leading-tight wrap-break-word">BATAS RUGI (STOP LOSS)</span>
              </div>
              <div className="shrink-0 font-bold text-red-700 text-xs bg-red-100 px-2 py-0.5 rounded-md whitespace-nowrap">
                -{result.skenarioRugi.persentase}%
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider block text-slate-500">Harga Jual BEI</span>
                <div className="text-sm sm:text-base font-extrabold text-slate-900 wrap-break-word">
                  {formatIDR(result.skenarioRugi.hargaBEI)}
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5 wrap-break-word">
                  Harga Exact: {formatIDR(result.skenarioRugi.hargaExact)}
                </div>
              </div>
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider block text-slate-500">Rugi Bersih</span>
                <div className="text-sm sm:text-base font-extrabold text-red-600 wrap-break-word">
                  -{formatIDR(result.skenarioRugi.rugiBersihReal)}
                </div>
              </div>
            </div>
          </div>
        </ExportCardWrapper>
      </div>
    </div>
  );
}
