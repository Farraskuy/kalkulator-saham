'use client';

import React, { createContext, useRef, useState, useEffect } from 'react';

export const ExportContext = createContext({ isExporting: false });
import { Download, Share2, Check } from 'lucide-react';
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
  const [isExporting, setIsExporting] = useState(false);
  const [shareDisclaimer, setShareDisclaimer] = useState(
    'Disclaimer: HitungSaham.com menyediakan edukasi & simulasi saham. Hasil hanya ilustrasi, bukan jaminan atau rekomendasi investasi. Keputusan investasi sepenuhnya tanggung jawab pengguna. Instrumen investasi berisiko termasuk kehilangan modal.'
  );

  useEffect(() => {
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data.shareDisclaimer) {
          setShareDisclaimer(data.shareDisclaimer);
        }
      })
      .catch(() => {});
  }, []);

  const handleDownloadImage = async () => {
    if (!cardRef.current) return;
    setDownloading(true);
    setIsExporting(true);
    await new Promise((resolve) => setTimeout(resolve, 100));

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
      setIsExporting(false);
      setDownloading(false);
    }
  };

  const handleShare = async () => {
    if (!cardRef.current) return;
    setIsExporting(true);
    await new Promise((resolve) => setTimeout(resolve, 100));

    try {
      const blob = await toBlob(cardRef.current, { cacheBust: true });
      if (!blob) return;

      const file = new File([blob], `${fileName}.png`, { type: 'image/png' });
      if (typeof navigator !== 'undefined' && navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: 'Hasil Kalkulasi HitungSaham',
          text: 'Lihat hasil kalkulasi saham saya di HitungSaham.com',
          files: [file],
        });
        return;
      }

      // Fallback if Web Share is not supported for files: copy image to clipboard
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.write([
          new ClipboardItem({ 'image/png': blob }),
        ]);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      }
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        console.error('Failed to share PNG image:', err);
      }
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <ExportContext.Provider value={{ isExporting }}>
      <div className={`relative ${embedded ? '' : 'bg-card border border-border-custom/50 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6'}`}>
      {/* CARD TOP HEADER */}
      <div className="pb-3 border-b border-border-custom/40">
        <div className="text-xs font-extrabold uppercase tracking-wider text-muted">
          Hasil Kalkulasi
        </div>
      </div>

      {/* EXPORTABLE CARD CONTAINER */}
      <div ref={cardRef} className="p-2 sm:p-3 bg-card rounded-xl space-y-4">
        {children}
        {isExporting && (
          <div className="border-t border-border-custom/30 pt-3 text-[9px] text-muted leading-relaxed text-center italic mt-1 max-w-sm mx-auto">
            {shareDisclaimer}
          </div>
        )}
      </div>

      {/* ACTION BUTTONS AT BOTTOM (PILL STYLED: UNDUH GAMBAR PNG & BAGIKAN) */}
      <div className="flex items-center gap-3 pt-3 w-full">
        <button
          type="button"
          onClick={handleDownloadImage}
          disabled={downloading}
          className="flex-1 h-11 sm:h-12 bg-acc-blue hover:bg-acc-blue/90 text-white rounded-full font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer disabled:opacity-50"
          title="Unduh Hasil Perhitungan Sebagai PNG"
        >
          <Download size={16} />
          <span>{downloading ? 'Mengunduh...' : 'Unduh Gambar PNG'}</span>
        </button>

        <button
          type="button"
          onClick={handleShare}
          className="h-11 sm:h-12 px-5 sm:px-6 bg-sub-slate hover:bg-sub-blue hover:text-acc-blue text-main rounded-full font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer border border-border-custom/40 shrink-0"
          title="Bagikan Gambar Hasil Perhitungan"
        >
          {copied ? <Check size={16} className="text-acc-green" /> : <Share2 size={16} />}
          <span>{copied ? 'Tersalin!' : 'Bagikan'}</span>
        </button>
      </div>
    </div>
    </ExportContext.Provider>
  );
}
