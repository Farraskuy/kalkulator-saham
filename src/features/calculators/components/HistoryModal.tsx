'use client';

import React, { useEffect, useState } from 'react';
import { History, Trash2, Clock, Calculator, X } from 'lucide-react';
import { CalculationHistoryItem } from '@/types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function HistoryModal({ isOpen, onClose }: Props) {
  const [histories, setHistories] = useState<CalculationHistoryItem[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/history');
      if (res.ok) {
        const data = await res.json();
        setHistories(data.histories || []);
      }
    } catch (err) {
      console.error('Failed to load calculation history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchHistory();
    }
  }, [isOpen]);

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/history?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setHistories(histories.filter((item) => item.id !== id));
      }
    } catch (err) {
      console.error('Failed to delete history item:', err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-card w-full max-w-lg rounded-2xl border border-border-custom/50 shadow-xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header Modal */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border-custom/50">
          <div className="flex items-center gap-2 font-extrabold text-main text-base">
            <div className="w-8 h-8 rounded-lg bg-sub-blue text-acc-blue flex items-center justify-center">
              <History size={18} />
            </div>
            <span>Histori Perhitungan Saya</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted hover:bg-sub-slate hover:text-main transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* List Content */}
        <div className="p-5 overflow-y-auto space-y-3 flex-1">
          {loading ? (
            <div className="py-12 text-center text-xs text-muted font-semibold">
              Memuat histori kalkulasi...
            </div>
          ) : histories.length === 0 ? (
            <div className="py-12 text-center text-xs text-muted space-y-2">
              <Calculator size={36} className="mx-auto text-muted/50" />
              <p className="font-semibold">Belum ada riwayat kalkulasi tersimpan.</p>
              <p className="text-[11px]">Hitung parameter di kalkulator untuk mencatat histori secara otomatis.</p>
            </div>
          ) : (
            histories.map((item) => {
              const dateStr = new Date(item.createdAt).toLocaleString('id-ID', {
                dateStyle: 'medium',
                timeStyle: 'short',
              });

              let badgeColor = 'bg-sub-blue text-acc-blue';
              let typeLabel = 'ARA / ARB';
              if (item.calculatorType === 'average') {
                badgeColor = 'bg-sub-purple text-acc-purple';
                typeLabel = 'Average Up/Down';
              } else if (item.calculatorType === 'prediction') {
                badgeColor = 'bg-sub-green text-acc-green';
                typeLabel = 'Target Jual/Beli';
              }

              return (
                <div
                  key={item.id}
                  className="bg-sub-slate/50 rounded-xl p-3.5 border border-border-custom/40 hover:border-acc-blue/30 transition-all space-y-2 group"
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md uppercase ${badgeColor}`}>
                      {typeLabel}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-muted flex items-center gap-1">
                        <Clock size={11} /> {dateStr}
                      </span>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="text-muted hover:text-acc-pink p-1 transition-colors cursor-pointer"
                        title="Hapus Histori"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  <div className="font-bold text-sm text-main">
                    {item.title}
                  </div>

                  {/* Summary Snippet */}
                  <div className="text-xs text-sub bg-card p-2.5 rounded-lg border border-border-custom/30 space-y-1">
                    {item.calculatorType === 'ara-arb' && (
                      <div className="flex justify-between">
                        <span>ARA: <strong className="text-acc-green">Rp {(item.results as { ara?: number })?.ara?.toLocaleString('id-ID')}</strong></span>
                        <span>ARB: <strong className="text-acc-pink">Rp {(item.results as { arb?: number })?.arb?.toLocaleString('id-ID')}</strong></span>
                      </div>
                    )}
                    {item.calculatorType === 'average' && (
                      <div className="flex justify-between">
                        <span>Avg Price: <strong className="text-acc-purple">Rp {(item.results as { avgPrice?: number })?.avgPrice?.toLocaleString('id-ID')}</strong></span>
                        <span>Total Lembar: <strong className="text-main">{(item.results as { totalLembar?: number })?.totalLembar?.toLocaleString('id-ID')}</strong></span>
                      </div>
                    )}
                    {item.calculatorType === 'prediction' && (
                      <div className="flex justify-between">
                        <span>TP BEI: <strong className="text-acc-green">Rp {(item.results as { skenarioUntung?: { hargaBEI?: number } })?.skenarioUntung?.hargaBEI?.toLocaleString('id-ID')}</strong></span>
                        <span>SL BEI: <strong className="text-acc-pink">Rp {(item.results as { skenarioRugi?: { hargaBEI?: number } })?.skenarioRugi?.hargaBEI?.toLocaleString('id-ID')}</strong></span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
