'use client';

import React, { useState } from 'react';
import { Target, TrendingUp, TrendingDown, Wallet, Calculator, RotateCcw, Calendar, User, Banknote } from 'lucide-react';
import { kalkulasiTargetSaham } from '@/features/calculators';
import { formatIDR, formatNumber, formatPercent, parseDecimalInput } from '@/lib/utils/formatters';
import type { FractionRule } from '@/types';
import ExportCardWrapper from '@/components/ui/ExportCardWrapper';

const sanitizeDecimalInput = (val: string): string => {
  let cleaned = val.replace(/\./g, ',').replace(/[^0-9,]/g, '');
  const firstCommaIndex = cleaned.indexOf(',');
  if (firstCommaIndex !== -1) {
    const before = cleaned.slice(0, firstCommaIndex + 1);
    const after = cleaned.slice(firstCommaIndex + 1).replace(/,/g, '');
    cleaned = before + after;
  }
  return cleaned;
};

interface Props {
  fractionRules?: FractionRule[];
  tax?: number;
}

export default function LandingPredictionCalculator({ fractionRules, tax = 0.0 }: Props) {
  const [ticker, setTicker] = useState<string>('');
  const [clientName, setClientName] = useState<string>('');
  const [hargaBeli, setHargaBeli] = useState<number>(0);
  const [lot, setLot] = useState<number>(0);
  const [feeBeli, setFeeBeli] = useState<number>(0);
  const [feeJual, setFeeJual] = useState<number>(0);
  const [feeBeliInput, setFeeBeliInput] = useState<string>('');
  const [feeJualInput, setFeeJualInput] = useState<string>('');
  const [targetUntungRp, setTargetUntungRp] = useState<number>(0);
  const [targetRugiRp, setTargetRugiRp] = useState<number>(0);
  const [profitPercent, setProfitPercent] = useState<number | null>(null);
  const [lossPercent, setLossPercent] = useState<number | null>(null);
  const [hasCalculated, setHasCalculated] = useState<boolean>(false);
  const [domainName, setDomainName] = useState<string>('HitungSaham.com');

  React.useEffect(() => {
    if (typeof window !== 'undefined' && window.location.hostname) {
      setDomainName(window.location.hostname);
    }
  }, []);

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

  const handleHargaBeliChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value.replace(/\D/g, '');
    const newPrice = rawVal ? parseInt(rawVal, 10) : 0;
    setHargaBeli(newPrice);

    if (newPrice > 0 && lot > 0) {
      const totalBuy = newPrice * lot * 100;
      if (profitPercent !== null) {
        setTargetUntungRp(Math.round((totalBuy * profitPercent) / 100));
      }
      if (lossPercent !== null) {
        setTargetRugiRp(Math.round((totalBuy * lossPercent) / 100));
      }
    }
  };

  const handleLotInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value.replace(/\D/g, '');
    const newLot = rawVal ? parseInt(rawVal, 10) : 0;
    setLot(newLot);

    if (hargaBeli > 0 && newLot > 0) {
      const totalBuy = hargaBeli * newLot * 100;
      if (profitPercent !== null) {
        setTargetUntungRp(Math.round((totalBuy * profitPercent) / 100));
      }
      if (lossPercent !== null) {
        setTargetRugiRp(Math.round((totalBuy * lossPercent) / 100));
      }
    }
  };

  const applyProfitPercent = (pct: number) => {
    if (profitPercent === pct) {
      setProfitPercent(null);
      setTargetUntungRp(0);
    } else {
      setProfitPercent(pct);
      if (hargaBeli > 0 && lot > 0) {
        const totalBuy = hargaBeli * lot * 100;
        setTargetUntungRp(Math.round((totalBuy * pct) / 100));
      }
    }
  };

  const applyLossPercent = (pct: number) => {
    if (lossPercent === pct) {
      setLossPercent(null);
      setTargetRugiRp(0);
    } else {
      setLossPercent(pct);
      if (hargaBeli > 0 && lot > 0) {
        const totalBuy = hargaBeli * lot * 100;
        setTargetRugiRp(Math.round((totalBuy * pct) / 100));
      }
    }
  };

  const applyLotPreset = (newLot: number) => {
    if (lot === newLot) {
      setLot(0);
      setTargetUntungRp(0);
      setTargetRugiRp(0);
    } else {
      setLot(newLot);
      if (hargaBeli > 0) {
        const totalBuy = hargaBeli * newLot * 100;
        if (profitPercent !== null) {
          setTargetUntungRp(Math.round((totalBuy * profitPercent) / 100));
        }
        if (lossPercent !== null) {
          setTargetRugiRp(Math.round((totalBuy * lossPercent) / 100));
        }
      }
    }
  };

  const handleCalculate = () => {
    setHasCalculated(true);
    setTimeout(() => {
      const el = document.getElementById('prediction-result');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }, 50);
  };

  const handleReset = () => {
    setTicker('');
    setClientName('');
    setHargaBeli(0);
    setLot(0);
    setFeeBeli(0);
    setFeeJual(0);
    setFeeBeliInput('');
    setFeeJualInput('');
    setTargetUntungRp(0);
    setTargetRugiRp(0);
    setProfitPercent(null);
    setLossPercent(null);
    setHasCalculated(false);
  };

  const cleanFileName = (() => {
    const domain = domainName.toLowerCase();
    const type = 'Rencana';
    const tickerVal = ticker ? ticker.toUpperCase() : 'NO-TICKER';
    const priceVal = hargaBeli || 0;
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const dateStr = `${yyyy}${mm}${dd}`;
    return `${domain}-${type}-${tickerVal}-${priceVal}-${dateStr}`;
  })();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 items-start gap-8">
      {/* Left Form Card */}
      <div className="flex flex-col justify-between space-y-4">
        <div>
          <div className="flex items-center justify-between pb-3 border-b border-border-custom/80 mb-5">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-md flex items-center justify-center bg-slate-900 text-white">
                <Target size={16} />
              </div>
              <span className="font-bold text-main text-sm">Parameter Risk &amp; Reward</span>
            </div>
            <button type="button" onClick={handleReset} className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-bold text-muted transition-colors hover:bg-sub-slate hover:text-main" title="Reset kalkulator">
              <RotateCcw size={13} /> Reset
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4 items-end">
            <div className="space-y-1">
              <label htmlFor="pred-ticker" className="text-[11px] font-bold text-muted block">
                Kode Saham
              </label>
              <input
                id="pred-ticker"
                type="text"
                className="w-full h-10 bg-card rounded-lg px-3 py-2 text-sm text-main font-bold outline-none focus:ring-1 focus:ring-acc-blue border border-border-custom uppercase transition-all placeholder:text-muted"
                value={ticker}
                onChange={handleTickerChange}
                placeholder="BBRI"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="pred-name" className="text-[11px] font-bold text-muted block">
                Nama (Opsional)
              </label>
              <input
                id="pred-name"
                type="text"
                className="w-full h-10 bg-card rounded-lg px-3 py-2 text-sm text-main font-semibold outline-none focus:ring-1 focus:ring-acc-blue border border-border-custom transition-all placeholder:text-muted"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="e.g. Budi"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div className="space-y-1">
              <label htmlFor="pred-price" className="text-[11px] font-bold text-muted block">
                Harga Beli (Rp)
              </label>
              <input
                id="pred-price"
                type="text"
                inputMode="numeric"
                className="w-full h-10 bg-card rounded-lg px-3 py-2 text-sm text-main font-semibold outline-none focus:ring-1 focus:ring-acc-blue border border-border-custom transition-all"
                value={hargaBeli ? formatNumber(hargaBeli) : ''}
                onChange={handleHargaBeliChange}
                placeholder="e.g. 1.000"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="pred-lot" className="text-[11px] font-bold text-muted block">
                Jumlah Lot
              </label>
              <input
                id="pred-lot"
                type="text"
                inputMode="numeric"
                className="w-full h-10 bg-card rounded-lg px-3 py-2 text-sm text-main font-semibold outline-none focus:ring-1 focus:ring-acc-blue border border-border-custom transition-all"
                value={lot ? formatNumber(lot) : ''}
                onChange={handleLotInputChange}
                placeholder="e.g. 10"
              />
              {/* Shortcut Lot Presets (Hanya Angka) */}
              <div className="pt-1">
                <span className="text-[9px] font-extrabold text-muted uppercase tracking-wider block mb-1">Shortcut Lot:</span>
                <div className="flex flex-wrap gap-1">
                  {[10, 50, 100, 500, 1000].map((unit) => (
                    <button
                      key={unit}
                      type="button"
                      onClick={() => applyLotPreset(unit)}
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md border transition-colors cursor-pointer ${
                        lot === unit
                          ? 'bg-slate-900 text-white border-slate-900 dark:bg-acc-blue dark:border-acc-blue'
                          : 'border-border-custom bg-sub-slate text-main hover:bg-border-custom/50'
                      }`}
                    >
                      {formatNumber(unit)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4 items-end">
            <div className="space-y-1">
              <label htmlFor="pred-feebeli" className="text-[11px] font-bold text-muted block">
                Fee Beli (%)
              </label>
              <input
                id="pred-feebeli"
                type="text"
                inputMode="decimal"
                className="w-full h-10 bg-card rounded-lg px-3 py-2 text-sm text-main font-semibold outline-none focus:ring-1 focus:ring-acc-blue border border-border-custom transition-all placeholder:text-muted"
                value={feeBeliInput}
                placeholder="e.g. 0,15"
                onChange={(e) => {
                  const sanitized = sanitizeDecimalInput(e.target.value);
                  setFeeBeliInput(sanitized);
                  setFeeBeli(parseDecimalInput(sanitized));
                }}
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="pred-feejual" className="text-[11px] font-bold text-muted block">
                Fee Jual (%)
              </label>
              <input
                id="pred-feejual"
                type="text"
                inputMode="decimal"
                className="w-full h-10 bg-card rounded-lg px-3 py-2 text-sm text-main font-semibold outline-none focus:ring-1 focus:ring-acc-blue border border-border-custom transition-all placeholder:text-muted"
                value={feeJualInput}
                placeholder="e.g. 0,25"
                onChange={(e) => {
                  const sanitized = sanitizeDecimalInput(e.target.value);
                  setFeeJualInput(sanitized);
                  setFeeJual(parseDecimalInput(sanitized));
                }}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
            <div className="space-y-1">
              <label htmlFor="pred-profit" className="text-[11px] font-bold text-muted block">
                Target Untung (Rp)
              </label>
              <input
                id="pred-profit"
                type="text"
                inputMode="numeric"
                className="w-full h-10 bg-card rounded-lg px-3 py-2 text-sm text-main font-semibold outline-none focus:ring-1 focus:ring-acc-blue border border-border-custom transition-all"
                value={targetUntungRp ? formatNumber(targetUntungRp) : ''}
                onChange={(e) => {
                  const rawVal = e.target.value.replace(/\D/g, '');
                  setTargetUntungRp(rawVal ? parseInt(rawVal, 10) : 0);
                  setProfitPercent(null);
                }}
                placeholder="e.g. 250.000"
              />
              {/* Preset Target Profit (+% TP) */}
              <div className="pt-1">
                <span className="text-[9px] font-extrabold text-muted uppercase tracking-wider block mb-1">Shortcut Target (+% TP):</span>
                <div className="flex flex-wrap gap-1">
                  {[2, 5, 10, 15, 20].map((pct) => (
                    <button
                      key={pct}
                      type="button"
                      onClick={() => applyProfitPercent(pct)}
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md border transition-colors cursor-pointer ${
                        profitPercent === pct
                          ? 'bg-emerald-600 text-white border-emerald-600'
                          : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/25'
                      }`}
                    >
                      +{pct}%
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <label htmlFor="pred-loss" className="text-[11px] font-bold text-muted block">
                Batas Rugi (Rp)
              </label>
              <input
                id="pred-loss"
                type="text"
                inputMode="numeric"
                className="w-full h-10 bg-card rounded-lg px-3 py-2 text-sm text-main font-semibold outline-none focus:ring-1 focus:ring-acc-blue border border-border-custom transition-all"
                value={targetRugiRp ? formatNumber(targetRugiRp) : ''}
                onChange={(e) => {
                  const rawVal = e.target.value.replace(/\D/g, '');
                  setTargetRugiRp(rawVal ? parseInt(rawVal, 10) : 0);
                  setLossPercent(null);
                }}
                placeholder="e.g. 100.000"
              />
              {/* Preset Stop Loss (-% SL) */}
              <div className="pt-1">
                <span className="text-[9px] font-extrabold text-muted uppercase tracking-wider block mb-1">Shortcut Rugi (-% SL):</span>
                <div className="flex flex-wrap gap-1">
                  {[2, 3, 5, 7].map((pct) => (
                    <button
                      key={pct}
                      type="button"
                      onClick={() => applyLossPercent(pct)}
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md border transition-colors cursor-pointer ${
                        lossPercent === pct
                          ? 'bg-rose-600 text-white border-rose-600'
                          : 'border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500/25'
                      }`}
                    >
                      -{pct}%
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Hitung Button for Mobile & Responsive */}
          <button
            type="button"
            onClick={handleCalculate}
            className="w-full h-11 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
          >
            <Calculator size={16} />
            <span>Hitung</span>
          </button>
        </div>
      </div>

      {/* Right Output Card (Hidden on mobile until Hitung is clicked) */}
      <div
        id="prediction-result"
        className={`w-full transition-all duration-300 ${hasCalculated ? 'block' : 'hidden lg:block'}`}
      >
        <ExportCardWrapper fileName={cleanFileName} calculatorType="prediction" embedded>
          <div className="flex items-start justify-between border-b border-border-custom/30 pb-3 mb-4 text-main gap-3">
            {/* Left Side: Ticker */}
            <div className="min-w-0">
              <div className="text-2xl sm:text-3xl font-extrabold tracking-tight uppercase whitespace-nowrap">
                {ticker}
              </div>
            </div>
            {/* Right Side: Date & Author */}
            <div className="text-[10px] font-medium text-muted space-y-1 text-left sm:text-right min-w-0">
              <div className="flex flex-wrap items-center justify-start sm:justify-end gap-1.5 leading-tight">
                <Calendar size={12} className="text-muted/80 shrink-0" />
                <span className="whitespace-nowrap">{new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
              </div>
              {clientName && (
                <div className="flex flex-wrap items-center justify-start sm:justify-end gap-1.5 font-semibold text-main dark:text-slate-300 leading-tight">
                  <User size={12} className="text-muted/80 shrink-0" />
                  <span>Dihitung oleh: <strong className="text-acc-blue font-bold">{clientName}</strong></span>
                </div>
              )}
            </div>
          </div>
          {/* Total Modal Banner (Solid Dark Slate, No Shadow, No Border) */}
          <div className="bg-slate-900 text-white rounded-xl p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-300 whitespace-nowrap">Total Investasi</div>
                <div className="text-base sm:text-2xl font-extrabold mt-1 text-white whitespace-nowrap">{formatIDR(result.rincian.totalModal)}</div>
              </div>
              <div className="shrink-0 text-white opacity-90">
                <Wallet size={24} />
              </div>
            </div>
            <div className="border-t border-slate-700/50 pt-3 mt-1 flex flex-wrap items-center justify-between gap-3 text-[10px] text-slate-300">
              <div className="flex-1 min-w-[100px] text-left">
                <span className="font-medium block text-slate-400 whitespace-nowrap">Harga Beli</span>
                <span className="text-xs sm:text-sm font-bold text-white block mt-0.5 whitespace-nowrap">{formatIDR(hargaBeli)}</span>
              </div>
              <div className="w-px h-8 bg-slate-700/50 shrink-0 hidden sm:block"></div>
              <div className="flex-1 min-w-[120px] text-right">
                <span className="font-medium block text-slate-400 whitespace-nowrap">Jumlah Saham</span>
                <div className="text-xs sm:text-sm font-bold text-white mt-0.5 leading-tight whitespace-nowrap">
                  <div>{formatNumber(lot)} lot</div>
                  <div className="text-[10px] text-slate-400 font-normal mt-0.5">({formatNumber(result.rincian.totalLembar)} lembar)</div>
                </div>
              </div>
            </div>
          </div>

          {/* Skenario Untung Box (Solid Emerald Light, No Border, No Shadow) */}
          <div className="bg-emerald-500/10 rounded-xl p-3.5 sm:p-4 mt-4 mb-3">
            <div className="flex flex-wrap items-center justify-between mb-3 gap-2 pb-2 border-b border-emerald-500/20">
              <div className="flex items-center gap-1.5 font-bold text-[10px] sm:text-xs text-emerald-800 dark:text-emerald-300 min-w-0">
                <TrendingUp size={14} className="shrink-0 text-emerald-700 dark:text-emerald-400" />
                <div className="flex flex-wrap items-center gap-x-1 leading-tight">
                  <span className="whitespace-nowrap">TARGET UNTUNG</span>
                  <span className="whitespace-nowrap opacity-90">(TAKE PROFIT)</span>
                </div>
              </div>
              <span className="shrink-0 font-bold text-emerald-700 dark:text-emerald-400 text-[10px] sm:text-xs bg-emerald-500/15 px-2 py-0.5 rounded-md whitespace-nowrap">
                +{formatPercent(result.skenarioUntung.persentase)}
              </span>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="min-w-0 text-left">
                <span className="text-[10px] font-bold uppercase tracking-wider block text-emerald-700 dark:text-emerald-400">Harga Jual</span>
                <div className="text-base sm:text-lg font-black text-emerald-900 dark:text-emerald-200 tracking-tight leading-tight">
                  {formatIDR(result.skenarioUntung.hargaBEI)}
                </div>
              </div>
              <div className="min-w-0 text-right">
                <span className="text-[10px] font-semibold uppercase tracking-wider block text-emerald-700/80 dark:text-emerald-400/80">Profit Bersih</span>
                <div className="text-xs sm:text-sm font-bold text-emerald-700 dark:text-emerald-400 mt-0.5 leading-tight">
                  +{formatIDR(result.skenarioUntung.labaBersihReal)}
                </div>
              </div>
            </div>
          </div>

          {/* New Take Profit Total Value Card */}
          <div className="bg-emerald-500/5 rounded-xl p-3 flex items-center justify-center gap-1.5 border border-emerald-500/10 mb-3 text-center">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/15 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
              <Banknote size={18} />
            </div>
            <div className="w-full min-w-0 text-center">
              <span className="text-[10px] font-bold text-emerald-800 dark:text-emerald-300 block">Total Nilai Jika Terjual</span>
              <span className="text-sm sm:text-base font-extrabold text-emerald-900 dark:text-emerald-200 block mt-0.5 leading-tight px-1">
                {formatIDR(result.rincian.totalModal + result.skenarioUntung.labaBersihReal)}
              </span>
            </div>
          </div>

          <div className="border-y border-border-custom/30 py-1 text-[10px] font-medium text-muted text-center">
            {domainName}
          </div>

          {/* Skenario Rugi Box (Solid Rose Light, No Border, No Shadow) */}
          <div className="bg-rose-500/10 rounded-xl p-3.5 sm:p-4 mt-3">
            <div className="flex flex-wrap items-center justify-between mb-3 gap-2 pb-2 border-b border-rose-500/20">
              <div className="flex items-center gap-1.5 font-bold text-[10px] sm:text-xs text-rose-800 dark:text-rose-300 min-w-0">
                <TrendingDown size={14} className="shrink-0 text-rose-700 dark:text-rose-400" />
                <div className="flex flex-wrap items-center gap-x-1 leading-tight">
                  <span className="whitespace-nowrap">BATAS RUGI</span>
                  <span className="whitespace-nowrap opacity-90">(STOP LOSS)</span>
                </div>
              </div>
              <div className="shrink-0 font-bold text-rose-700 dark:text-rose-400 text-[10px] sm:text-xs bg-rose-500/15 px-2 py-0.5 rounded-md whitespace-nowrap">
                -{formatPercent(Math.abs(result.skenarioRugi.persentase))}
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="min-w-0 text-left">
                <span className="text-[10px] font-bold uppercase tracking-wider block text-rose-700 dark:text-rose-400">Harga Jual</span>
                <div className="text-base sm:text-lg font-black text-rose-900 dark:text-rose-200 tracking-tight leading-tight">
                  {formatIDR(result.skenarioRugi.hargaBEI)}
                </div>
              </div>
              <div className="min-w-0 text-right">
                <span className="text-[10px] font-semibold uppercase tracking-wider block text-rose-700/80 dark:text-rose-400/80">Rugi Bersih</span>
                <div className="text-xs sm:text-sm font-bold text-rose-700 dark:text-rose-400 mt-0.5 leading-tight">
                  -{formatIDR(Math.abs(result.skenarioRugi.rugiBersihReal))}
                </div>
              </div>
            </div>
          </div>

          {/* New Stop Loss Total Value Card */}
          <div className="bg-rose-500/5 rounded-xl p-3 flex items-center justify-center gap-1.5 border border-rose-500/10 mt-3 text-center">
            <div className="w-8 h-8 rounded-lg bg-rose-500/15 flex items-center justify-center text-rose-600 dark:text-rose-400 shrink-0">
              <Banknote size={18} />
            </div>
            <div className="w-full min-w-0 text-center">
              <span className="text-[10px] font-bold text-rose-800 dark:text-rose-300 block">Total Nilai Jika Terjual</span>
              <span className="text-sm sm:text-base font-extrabold text-rose-900 dark:text-rose-200 block mt-0.5 leading-tight px-1">
                {formatIDR(result.rincian.totalModal - result.skenarioRugi.rugiBersihReal)}
              </span>
            </div>
          </div>
        </ExportCardWrapper>
      </div>
    </div>
  );
}
