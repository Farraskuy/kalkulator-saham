'use client';

import React, { useState } from 'react';
import { Layers, Plus, Trash2, Calculator, RotateCcw, Calendar } from 'lucide-react';
import { calculateAverage, calculateTargetAverageLots, PurchaseRow } from '@/features/calculators';
import { formatIDR, formatNumber } from '@/lib/utils/formatters';
import ExportCardWrapper from '@/components/ui/ExportCardWrapper';

export default function LandingAvgCalculator() {
  const [ticker, setTicker] = useState<string>('');
  const [rows, setRows] = useState<PurchaseRow[]>([
    { id: '1', price: 0, lot: 0 },
  ]);

  const [targetAvg, setTargetAvg] = useState<number>(0);
  const [newPrice, setNewPrice] = useState<number>(0);
  const [hasCalculated, setHasCalculated] = useState<boolean>(false);
  const [domainName, setDomainName] = useState<string>('HitungSaham.com');

  React.useEffect(() => {
    if (typeof window !== 'undefined' && window.location.hostname) {
      setDomainName(window.location.hostname);
    }
  }, []);

  const result = calculateAverage(rows);

  const handleTickerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const cleanTicker = e.target.value.replace(/[^a-zA-Z]/g, '').slice(0, 4).toUpperCase();
    setTicker(cleanTicker);
  };

  const handleUpdateRow = (index: number, field: 'price' | 'lot', value: string) => {
    const rawVal = value.replace(/\D/g, '');
    const num = rawVal ? parseInt(rawVal, 10) : 0;
    const newRows = [...rows];
    newRows[index] = { ...newRows[index], [field]: num };
    setRows(newRows);
  };

  const handleAddRow = () => {
    setRows([...rows, { id: Date.now().toString(), price: 0, lot: 0 }]);
  };

  const handleRemoveRow = (index: number) => {
    if (rows.length <= 1) return;
    setRows(rows.filter((_, i) => i !== index));
  };

  const handleCalculate = () => {
    setHasCalculated(true);
    setTimeout(() => {
      const el = document.getElementById('avg-result');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }, 50);
  };

  const handleReset = () => {
    setTicker('');
    setRows([
      { id: '1', price: 0, lot: 0 },
    ]);
    setTargetAvg(0);
    setNewPrice(0);
    setHasCalculated(false);
  };

  const { neededLots, neededCapital } = calculateTargetAverageLots(
    targetAvg,
    newPrice,
    result.totalLembar,
    result.totalInvestment
  );

  const cleanFileName = (() => {
    const domain = domainName.toLowerCase();
    const type = 'Average';
    const tickerVal = ticker ? ticker.toUpperCase() : 'NO-TICKER';
    const priceVal = Math.round(result.avgPrice) || 0;
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
      <div className="flex flex-col justify-between space-y-6">
        <div>
          <div className="flex items-center justify-between pb-3 border-b border-border-custom mb-5">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-md flex items-center justify-center bg-slate-900 text-white">
                <Layers size={16} />
              </div>
              <span className="font-bold text-main text-sm">Daftar Pembelian Saham</span>
            </div>
            <button type="button" onClick={handleReset} className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-bold text-muted transition-colors hover:bg-sub-slate hover:text-main" title="Reset kalkulator">
              <RotateCcw size={13} /> Reset
            </button>
          </div>

          <div className="space-y-1.5 mb-5">
            <label htmlFor="avg-ticker" className="text-[11px] font-bold text-muted block">
              Kode Saham
            </label>
            <input
              id="avg-ticker"
              type="text"
              className="w-full h-10 bg-card rounded-lg px-3 py-2 text-sm text-main font-bold outline-none focus:ring-1 focus:ring-acc-blue border border-border-custom transition-all uppercase placeholder:text-muted"
              value={ticker}
              onChange={handleTickerChange}
              placeholder="BBRI"
            />
          </div>

          <div className="space-y-3 mb-5">
            {rows.map((row, index) => (
              <div key={row.id} className="grid grid-cols-12 gap-2 items-end">
                <div className="col-span-1 pb-2.5 text-center text-xs font-bold text-muted">#{index + 1}</div>
                <div className="col-span-5 space-y-1">
                  <label className="block text-[10px] font-bold text-muted">Harga Beli (Rp)</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    className="w-full h-9 bg-card rounded-lg px-3 py-2 text-main font-semibold outline-none focus:ring-1 focus:ring-acc-blue text-xs border border-border-custom"
                    value={row.price ? formatNumber(row.price) : ''}
                    onChange={(e) => handleUpdateRow(index, 'price', e.target.value)}
                    placeholder="Harga (Rp)"
                  />
                </div>
                <div className="col-span-5 space-y-1">
                  <label className="block text-[10px] font-bold text-muted">Jumlah Lot</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    className="w-full h-9 bg-card rounded-lg px-3 py-2 text-main font-semibold outline-none focus:ring-1 focus:ring-acc-blue text-xs border border-border-custom"
                    value={row.lot ? formatNumber(row.lot) : ''}
                    onChange={(e) => handleUpdateRow(index, 'lot', e.target.value)}
                    placeholder="Lot"
                  />
                </div>
                <div className="col-span-1 flex justify-center pb-1.5">
                  {rows.length > 1 && (
                    <button
                      onClick={() => handleRemoveRow(index)}
                      className="text-muted hover:text-acc-red p-1 transition-colors cursor-pointer"
                      title="Hapus Baris"
                    >
                      <Trash2 size={15} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={handleAddRow}
            className="flex items-center justify-center gap-1.5 w-full bg-sub-slate hover:bg-slate-200 dark:hover:bg-slate-700 text-main border border-border-custom font-bold py-2.5 px-4 rounded-lg text-xs transition-colors cursor-pointer mb-5"
          >
            <Plus size={15} />
            <span>Tambah Baris Pembelian</span>
          </button>

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

        {/* Target Avg Helper */}
        <div className="border-t border-border-custom/80 pt-5 mt-2">
          <div className="flex items-center gap-2 font-bold text-xs text-sub mb-3">
            <Calculator size={15} /> Hitung Kebutuhan Lot untuk Target Average
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-muted block">Target Avg Baru (Rp)</label>
              <input
                type="text"
                inputMode="numeric"
                className="w-full h-9 bg-card rounded-lg px-3 py-2 text-main font-semibold outline-none focus:ring-1 focus:ring-acc-blue text-xs border border-border-custom"
                value={targetAvg ? formatNumber(targetAvg) : ''}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '');
                  setTargetAvg(val ? parseInt(val, 10) : 0);
                }}
                placeholder="Masukkan target avg"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-muted block">Harga Pembelian Baru (Rp)</label>
              <input
                type="text"
                inputMode="numeric"
                className="w-full h-9 bg-card rounded-lg px-3 py-2 text-main font-semibold outline-none focus:ring-1 focus:ring-acc-blue text-xs border border-border-custom"
                value={newPrice ? formatNumber(newPrice) : ''}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '');
                  setNewPrice(val ? parseInt(val, 10) : 0);
                }}
                placeholder="Masukkan harga baru"
              />
            </div>
          </div>

          {neededLots > 0 && (
            <div className="bg-sub-slate border border-border-custom rounded-xl p-3 mt-3 text-xs">
              <span className="font-bold text-main block mb-1">Kebutuhan Tambahan:</span>
              <div className="flex flex-col sm:flex-row sm:justify-between gap-1 text-sub text-[11px]">
                <span>Jumlah Lot: <strong className="text-main">{formatNumber(neededLots)} Lot</strong></span>
                <span>Estimasi Modal: <strong className="text-main">{formatIDR(neededCapital)}</strong></span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right Output Card (Hidden on mobile until Hitung is clicked) */}
      <div
        id="avg-result"
        className={`w-full transition-all duration-300 ${hasCalculated ? 'block' : 'hidden lg:block'}`}
      >
        <ExportCardWrapper fileName={cleanFileName} calculatorType="average" embedded>
          <div className="flex flex-wrap justify-between items-start border-b border-border-custom/30 pb-3 mb-4 text-main gap-2">
            {/* Left Side: Ticker */}
            <div className="min-w-0">
              <div className="text-2xl sm:text-3xl font-extrabold tracking-tight uppercase break-all">
                {ticker}
              </div>
            </div>
            {/* Right Side: Date */}
            <div className="text-[10px] font-medium text-muted space-y-1 text-left sm:text-right min-w-0">
              <div className="flex flex-wrap items-center justify-start sm:justify-end gap-1.5 leading-tight">
                <Calendar size={12} className="text-muted/80 shrink-0" />
                <span className="whitespace-nowrap">{new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
              </div>
            </div>
          </div>
          {/* Main Avg Price Card (Solid Purple, No Gradient, No Shadow, No Border) */}
          <div className="bg-[#7c3aed] text-white rounded-xl p-5 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="text-[10px] font-extrabold uppercase tracking-wider text-purple-100">Harga Rata-Rata per Lembar (Avg Price)</div>
              <div className="text-2xl sm:text-3xl font-extrabold mt-1 text-white break-all [overflow-wrap:anywhere] leading-tight">{formatIDR(result.avgPrice)}</div>
            </div>
            <div className="text-white opacity-95 shrink-0">
              <Layers size={26} />
            </div>
          </div>

          <div className="border-y border-border-custom/30 py-1 text-[10px] font-medium text-muted text-center">
            {domainName}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
            <div className="bg-violet-500/10 rounded-xl p-3.5 space-y-1">
              <span className="text-[10px] font-extrabold uppercase tracking-wider block text-violet-700 dark:text-violet-400">Total Lembar Saham</span>
              <span className="text-base font-extrabold block text-violet-800 dark:text-violet-300 break-all [overflow-wrap:anywhere] leading-tight">{formatNumber(result.totalLembar)} Lembar</span>
            </div>
            <div className="bg-violet-500/10 rounded-xl p-3.5 space-y-1 sm:text-right">
              <span className="text-[10px] font-extrabold uppercase tracking-wider block text-violet-700 dark:text-violet-400">Total Investasi Pembelian</span>
              <span className="text-base font-extrabold block text-violet-800 dark:text-violet-300 break-all [overflow-wrap:anywhere] leading-tight">{formatIDR(result.totalInvestment)}</span>
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border border-border-custom mt-4">
            <div className="border-b border-border-custom bg-sub-slate px-3.5 py-2.5">
              <h3 className="text-xs font-bold text-main">Rincian pembelian</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[360px] text-left text-xs">
                <thead className="border-b border-border-custom text-[10px] font-bold uppercase tracking-wide text-muted">
                  <tr>
                    <th className="px-3.5 py-2.5">No.</th>
                    <th className="px-3.5 py-2.5">Harga beli</th>
                    <th className="px-3.5 py-2.5 text-right">Lot</th>
                    <th className="px-3.5 py-2.5 text-right">Investasi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-custom">
                  {rows.some((row) => row.price > 0 || row.lot > 0) ? rows.map((row, index) => (
                    <tr key={row.id}>
                      <td className="px-3.5 py-2.5 font-semibold text-muted">#{index + 1}</td>
                      <td className="px-3.5 py-2.5 font-semibold text-main">{formatIDR(row.price)}</td>
                      <td className="px-3.5 py-2.5 text-right font-semibold text-main">{formatNumber(row.lot)}</td>
                      <td className="px-3.5 py-2.5 text-right font-semibold text-main">{formatIDR(row.price * row.lot * 100)}</td>
                    </tr>
                  )) : (
                    <tr><td colSpan={4} className="px-3.5 py-4 text-center text-muted">Belum ada transaksi pembelian.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </ExportCardWrapper>
      </div>
    </div>
  );
}
