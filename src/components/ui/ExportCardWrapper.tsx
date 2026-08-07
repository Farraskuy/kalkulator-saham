'use client';

import React, { useRef, useState } from 'react';
import { Download, Check } from 'lucide-react';
import { toPng, toBlob } from 'html-to-image';

interface ExportCardWrapperProps {
  children: React.ReactNode;
  fileName?: string;
  calculatorType?: 'ara-arb' | 'average' | 'prediction';
  embedded?: boolean;
}

export default function ExportCardWrapper({
  children,
  fileName = 'kalkulasi-saham',
  embedded = false,
}: ExportCardWrapperProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleDownloadImage = async () => {
    if (!cardRef.current) return;
    setDownloading(true);

    try {
      const dataUrl = await toPng(cardRef.current, { cacheBust: true });
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `${fileName}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Failed to export PNG card image:', err);
    } finally {
      setDownloading(false);
    }
  };

  const handleCopyImage = async () => {
    if (!cardRef.current) return;
    try {
      const blob = await toBlob(cardRef.current, { cacheBust: true });
      if (!blob) return;

      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob }),
      ]);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy PNG card image:', err);
    }
  };

  return (
    <div className={`relative ${embedded ? '' : 'bg-card border border-border-custom/50 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6'}`}>
      <div className="flex items-center justify-between pb-3 border-b border-border-custom/40">
        <div className="text-xs font-extrabold uppercase tracking-wider text-muted">
          Hasil Kalkulasi BEI
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyImage}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-sub-slate text-main hover:bg-sub-blue hover:text-acc-blue transition-all cursor-pointer border border-border-custom/40"
            title="Salin Gambar ke Clipboard"
          >
            {copied ? <Check size={14} className="text-acc-green" /> : <Download size={14} />}
            <span>{copied ? 'Tersalin!' : 'Salin PNG'}</span>
          </button>

          <button
            onClick={handleDownloadImage}
            disabled={downloading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-acc-blue text-white hover:bg-acc-blue/90 transition-all cursor-pointer shadow-xs disabled:opacity-50"
            title="Unduh Hasil Perhitungan Sebagai PNG"
          >
            <Download size={14} />
            <span>{downloading ? 'Mengunduh...' : 'Unduh PNG'}</span>
          </button>
        </div>
      </div>

      <div ref={cardRef} className="p-2 sm:p-3 bg-card rounded-xl space-y-4">
        {children}

        <div className="pt-3 border-t border-border-custom/30 flex items-center justify-between text-[10px] text-muted font-medium">
          <span>Kalkulator Saham BEI • HitungSaham</span>
          <span>{new Date().toLocaleDateString('id-ID', { dateStyle: 'medium' })}</span>
        </div>
      </div>
    </div>
  );
}
