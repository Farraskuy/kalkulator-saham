'use client';

import React, { useState } from 'react';
import { Layers, Plus, Trash2, Calculator } from 'lucide-react';
import { calculateAverage, formatIDR, formatNumber, PurchaseRow } from '@/lib/calculations';
import ExportCardWrapper from '@/components/ui/ExportCardWrapper';

export default function LandingTwoAvgCalculator() {
  const [ticker, setTicker] = useState<string>('BBRI');
  const [rows, setRows] = useState<PurchaseRow[]>([
    { id: '1', price: 1000, lot: 10 },
    { id: '2', price: 800, lot: 15 },
  ]);

  const [targetAvg, setTargetAvg] = useState<number>(0);
  const [newPrice, setNewPrice] = useState<number>(0);
  const [hasCalculated, setHasCalculated] = useState<boolean>(false);

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
      const el = document.getElementById('landing2-avg-result');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }, 50);
  };

  let neededLots = 0;
  let neededCapital = 0;

  if (targetAvg > 0 && newPrice > 0 && result.totalLembar > 0 && targetAvg !== newPrice) {
    const numerator = targetAvg * result.totalLembar - result.totalInvestment;
    const denominator = 100 * (newPrice - targetAvg);
    if (denominator !== 0) {
      const calcLot = Math.ceil(numerator / denominator);
      if (calcLot > 0) {
        neededLots = calcLot;
        neededCapital = neededLots * 100 * newPrice;
      }
    }
  }

  const cleanFileName = ticker ? `kalkulator-average-${ticker}` : `kalkulator-average`;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 items-start gap-8">
      {/* Left Form Card */}
      <div className="flex flex-col justify-between space-y-6">
        <div>
          <div className="flex items-center justify-between pb-3 border-b border-gray-200/80 mb-5">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-md flex items-center justify-center bg-slate-900 text-white">
                <Layers size={16} />
              </div>
              <span className="font-bold text-slate-900 text-sm">Daftar Pembelian Saham</span>
            </div>
          </div>

          <div className="space-y-1.5 mb-5">
            <label htmlFor="landing2-avg-ticker" className="text-[11px] font-bold text-slate-500 block">
              Kode Ticker Saham (Max 4 Huruf)
            </label>
            <input
              id="landing2-avg-ticker"
              type="text"
              className="w-full h-10 bg-white rounded-lg px-3 py-2 text-sm text-slate-900 font-bold outline-none focus:ring-1 focus:ring-slate-900 border border-slate-200 transition-all uppercase placeholder-slate-400"
              value={ticker}
              onChange={handleTickerChange}
              placeholder="e.g. BBRI"
            />
          </div>

          <div className="space-y-3 mb-5">
            {rows.map((row, index) => (
              <div key={row.id} className="grid grid-cols-12 gap-2 items-center">
                <div className="col-span-1 text-xs font-bold text-slate-400 text-center">#{index + 1}</div>
                <div className="col-span-5">
                  <input
                    type="text"
                    inputMode="numeric"
                    className="w-full h-9 bg-white rounded-lg px-3 py-2 text-slate-900 font-semibold outline-none focus:ring-1 focus:ring-slate-900 text-xs border border-slate-200"
                    value={row.price ? formatNumber(row.price) : ''}
                    onChange={(e) => handleUpdateRow(index, 'price', e.target.value)}
                    placeholder="Harga (Rp)"
                  />
                </div>
                <div className="col-span-5">
                  <input
                    type="text"
                    inputMode="numeric"
                    className="w-full h-9 bg-white rounded-lg px-3 py-2 text-slate-900 font-semibold outline-none focus:ring-1 focus:ring-slate-900 text-xs border border-slate-200"
                    value={row.lot ? formatNumber(row.lot) : ''}
                    onChange={(e) => handleUpdateRow(index, 'lot', e.target.value)}
                    placeholder="Lot"
                  />
                </div>
                <div className="col-span-1 flex justify-center">
                  {rows.length > 1 && (
                    <button
                      onClick={() => handleRemoveRow(index)}
                      className="text-slate-400 hover:text-red-600 p-1 transition-colors cursor-pointer"
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
            className="flex items-center justify-center gap-1.5 w-full bg-slate-100 hover:bg-slate-200 text-slate-900 border border-slate-200 font-bold py-2.5 px-4 rounded-lg text-xs transition-colors cursor-pointer mb-5"
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
            <span>Hitung Harga Average &amp; Modal</span>
          </button>
        </div>

        {/* Target Avg Helper */}
        <div className="border-t border-slate-200/80 pt-5 mt-2">
          <div className="flex items-center gap-2 font-bold text-xs text-slate-600 mb-3">
            <Calculator size={15} /> Hitung Kebutuhan Lot untuk Target Average
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 block">Target Avg Baru (Rp)</label>
              <input
                type="text"
                inputMode="numeric"
                className="w-full h-9 bg-white rounded-lg px-3 py-2 text-slate-900 font-semibold outline-none focus:ring-1 focus:ring-slate-900 text-xs border border-slate-200"
                value={targetAvg ? formatNumber(targetAvg) : ''}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '');
                  setTargetAvg(val ? parseInt(val, 10) : 0);
                }}
                placeholder="Masukkan target avg"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 block">Harga Pembelian Baru (Rp)</label>
              <input
                type="text"
                inputMode="numeric"
                className="w-full h-9 bg-white rounded-lg px-3 py-2 text-slate-900 font-semibold outline-none focus:ring-1 focus:ring-slate-900 text-xs border border-slate-200"
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
            <div className="bg-slate-100 border border-slate-200 rounded-xl p-3 mt-3 text-xs">
              <span className="font-bold text-slate-900 block mb-1">Kebutuhan Tambahan:</span>
              <div className="flex flex-col sm:flex-row sm:justify-between gap-1 text-slate-600 text-[11px]">
                <span>Jumlah Lot: <strong className="text-slate-900">{formatNumber(neededLots)} Lot</strong></span>
                <span>Estimasi Modal: <strong className="text-slate-900">{formatIDR(neededCapital)}</strong></span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right Output Card (Hidden on mobile until Hitung is clicked) */}
      <div
        id="landing2-avg-result"
        className={`w-full transition-all duration-300 ${hasCalculated ? 'block' : 'hidden lg:block'}`}
      >
        <ExportCardWrapper fileName={cleanFileName} calculatorType="average" embedded>
          {/* Main Avg Price Card (Solid Purple, No Gradient, No Shadow, No Border) */}
          <div className="bg-[#7c3aed] text-white rounded-xl p-5 flex items-center justify-between">
            <div>
              <div className="text-[10px] font-extrabold uppercase tracking-wider text-purple-100">Harga Rata-Rata per Lembar (Avg Price)</div>
              <div className="text-2xl sm:text-3xl font-extrabold mt-1 text-white">{formatIDR(result.avgPrice)}</div>
            </div>
            <div className="text-white opacity-95">
              <Layers size={26} />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
            <div className="bg-[#f5f3ff] rounded-xl p-3.5 space-y-1">
              <span className="text-[10px] font-extrabold uppercase tracking-wider block text-[#6d28d9]">Total Lembar Saham</span>
              <span className="text-base font-extrabold block text-[#4c1d95] wrap-break-word">{formatNumber(result.totalLembar)} Lembar</span>
            </div>
            <div className="bg-[#f5f3ff] rounded-xl p-3.5 space-y-1">
              <span className="text-[10px] font-extrabold uppercase tracking-wider block text-[#6d28d9]">Total Investasi Pembelian</span>
              <span className="text-base font-extrabold block text-[#4c1d95] wrap-break-word">{formatIDR(result.totalInvestment)}</span>
            </div>
          </div>
        </ExportCardWrapper>
      </div>
    </div>
  );
}
