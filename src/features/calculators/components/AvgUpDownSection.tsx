'use client';

import React, { useState } from 'react';
import { Layers, Plus, Trash2, Calculator } from 'lucide-react';
import { calculateAverage, formatIDR, formatNumber, PurchaseRow } from '@/features/calculators/services/calculations';
import ExportCardWrapper from '@/components/ui/ExportCardWrapper';

export default function AvgUpDownSection() {
  const [ticker, setTicker] = useState<string>('BBRI');
  const [rows, setRows] = useState<PurchaseRow[]>([
    { id: '1', price: 1000, lot: 10 },
    { id: '2', price: 800, lot: 15 },
  ]);

  const [targetAvg, setTargetAvg] = useState<number>(0);
  const [newPrice, setNewPrice] = useState<number>(0);
  const [showMobileResult, setShowMobileResult] = useState(false);

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
    <section id="avg-up-down" className="space-y-6 scroll-mt-20">
      <div className="pb-4 px-4 sm:px-0">
        <h2 className="text-xl sm:text-2xl font-extrabold flex items-center gap-2.5 text-main mt-1">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white bg-acc-purple shadow-acc-purple/20">
            <Layers size={20} />
          </div>
          Simulasi Average Up / Down
        </h2>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-muted">
          Gabungkan beberapa transaksi untuk mengetahui harga beli rata-rata, total saham, dan modal; cocok untuk simulasi average up maupun average down.
        </p>
        <div className="mt-3 inline-flex rounded-xl bg-sub-purple px-3 py-2 text-xs font-semibold text-acc-purple">
          Rumus: harga rata-rata = total (harga x jumlah saham) / total jumlah saham.
        </div>
      </div>

      <div className="overflow-hidden rounded-none sm:rounded-2xl bg-card border-0 sm:border border-border-custom/50">
        <div className="grid grid-cols-1 lg:grid-cols-2 items-start">
          {/* Left Form Card */}
          <div className="p-6 sm:p-8 flex flex-col justify-between min-h-[420px]">
            <div>
              <div className="flex items-center justify-between pb-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-sub-purple text-acc-purple">
                    <Layers size={18} />
                  </div>
                  <span className="font-bold text-main">Daftar Pembelian Saham</span>
                </div>
              </div>

              <div className="space-y-1.5 mb-6">
                <label htmlFor="avg-ticker" className="text-[11px] font-bold text-muted block min-h-4 leading-tight">
                  Kode Ticker Saham (Max 4 Huruf)
                </label>
                <input
                  id="avg-ticker"
                  type="text"
                  className="w-full h-10 bg-sub-slate/60 rounded-lg px-3 py-2 text-sm text-main font-bold outline-none focus:ring-1 focus:ring-acc-purple transition-all uppercase placeholder-gray-400 border-0"
                  value={ticker}
                  onChange={handleTickerChange}
                  placeholder="e.g. BBRI"
                />
              </div>

              <div className="space-y-3 mb-6">
                {rows.map((row, index) => (
                  <div key={row.id} className="grid grid-cols-12 gap-2.5 items-center">
                    <div className="col-span-1 text-xs font-bold text-muted text-center">#{index + 1}</div>
                    <div className="col-span-5">
                      <input
                        type="text"
                        inputMode="numeric"
                        className="w-full h-9 bg-sub-slate/60 rounded-lg px-3 py-2 text-main font-semibold outline-none focus:ring-1 focus:ring-acc-purple text-xs border-0"
                        value={row.price ? formatNumber(row.price) : ''}
                        onChange={(e) => handleUpdateRow(index, 'price', e.target.value)}
                        placeholder="Harga (Rp)"
                      />
                    </div>
                    <div className="col-span-5">
                      <input
                        type="text"
                        inputMode="numeric"
                        className="w-full h-9 bg-sub-slate/60 rounded-lg px-3 py-2 text-main font-semibold outline-none focus:ring-1 focus:ring-acc-purple text-xs border-0"
                        value={row.lot ? formatNumber(row.lot) : ''}
                        onChange={(e) => handleUpdateRow(index, 'lot', e.target.value)}
                        placeholder="Lot"
                      />
                    </div>
                    <div className="col-span-1 flex justify-center">
                      {rows.length > 1 && (
                        <button
                          onClick={() => handleRemoveRow(index)}
                          className="text-muted hover:text-acc-pink p-1 transition-colors cursor-pointer"
                          title="Hapus Baris"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={handleAddRow}
                className="flex items-center justify-center gap-1.5 w-full bg-sub-purple text-acc-purple hover:bg-sub-purple/80 font-bold py-2.5 px-4 rounded-lg text-xs transition-colors cursor-pointer"
              >
                <Plus size={16} />
                <span>Tambah Baris Pembelian</span>
              </button>
            </div>

            {/* Calculator helper for Target Average */}
            <div className="border-t border-border-custom/50 pt-6 mt-6">
              <div className="flex items-center gap-2 font-bold text-xs text-muted mb-3">
                <Calculator size={15} /> Hitung Kebutuhan Lot untuk Target Average
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-muted block min-h-4 leading-tight">Target Avg Baru (Rp)</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    className="w-full h-9 bg-sub-slate/60 rounded-lg px-3 py-2 text-main font-semibold outline-none focus:ring-1 focus:ring-acc-purple text-xs border-0"
                    value={targetAvg ? formatNumber(targetAvg) : ''}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '');
                      setTargetAvg(val ? parseInt(val, 10) : 0);
                    }}
                    placeholder="Masukkan target avg"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-muted block min-h-4 leading-tight">Harga Pembelian Baru (Rp)</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    className="w-full h-9 bg-sub-slate/60 rounded-lg px-3 py-2 text-main font-semibold outline-none focus:ring-1 focus:ring-acc-purple text-xs border-0"
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
                <div className="bg-sub-purple rounded-xl p-3 mt-3 text-xs">
                  <span className="font-bold text-acc-purple block mb-1">Kebutuhan Tambahan:</span>
                  <div className="flex flex-col sm:flex-row sm:justify-between gap-1 text-muted text-[11px]">
                    <span>Jumlah Lot: <strong className="text-main">{formatNumber(neededLots)} Lot</strong></span>
                    <span>Estimasi Modal: <strong className="text-main">{formatIDR(neededCapital)}</strong></span>
                  </div>
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={() => {
                setShowMobileResult(true);
                setTimeout(() => document.getElementById('average-result')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 0);
              }}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-acc-purple px-5 py-3 text-sm font-bold text-white lg:hidden"
            >
              <Calculator size={18} /> Hitung &amp; Tampilkan Hasil
            </button>
          </div>

          {/* Right Output Card */}
          <div id="average-result" className={`${showMobileResult ? 'block' : 'hidden'} scroll-mt-20 border-t border-border-custom/50 p-6 sm:p-8 lg:block lg:border-l lg:border-t-0`}>
            <ExportCardWrapper fileName={cleanFileName} calculatorType="average" embedded>
              {/* Main Avg Price Card */}
              <div className="bg-gradient-to-r from-acc-purple to-acc-purple/90 text-white rounded-xl p-5 flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-extrabold uppercase tracking-wider opacity-85">Harga Rata-Rata per Lembar (Avg Price)</div>
                  <div className="text-2xl sm:text-3xl font-extrabold mt-1">{formatIDR(result.avgPrice)}</div>
                </div>
                <div>
                  <Layers size={28} />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mt-4 mb-4">
                <div className="bg-sub-purple text-acc-purple rounded-xl p-3.5 space-y-1">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider block text-muted">Total Lembar Saham</span>
                  <span className="text-base sm:text-lg font-extrabold block text-main break-words">{formatNumber(result.totalLembar)} Lembar</span>
                </div>
                <div className="bg-sub-purple text-acc-purple rounded-xl p-3.5 space-y-1">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider block text-muted">Total Investasi Pembelian</span>
                  <span className="text-base sm:text-lg font-extrabold block text-main break-words">{formatIDR(result.totalInvestment)}</span>
                </div>
              </div>
            </ExportCardWrapper>
          </div>
        </div>
      </div>
    </section>
  );
}
