'use client';

import React, { useEffect, useState } from 'react';
import { Save, FileText } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';
import { AdminCrudHeader } from '@/features/admin/components/AdminCrudHeader';

export default function AdminSettingsPage() {
  const { showToast } = useToast();
  const [siteDescription, setSiteDescription] = useState('');
  const [terms, setTerms] = useState('');
  const [shareDisclaimer, setShareDisclaimer] = useState('');
  const [taxSetting, setTaxSetting] = useState<number>(0.0);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data.siteDescription) setSiteDescription(data.siteDescription);
        if (data.terms) setTerms(data.terms);
        if (data.shareDisclaimer) setShareDisclaimer(data.shareDisclaimer);
        if (data.tax) setTaxSetting(parseFloat(data.tax) || 0.0);
      })
      .catch((err) => console.error('Failed to load settings:', err));
  }, []);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ siteDescription, terms, shareDisclaimer, tax: taxSetting }),
      });

      if (res.ok) {
        showToast('Pengaturan Syarat, Ketentuan, Deskripsi & Pajak berhasil diperbarui!', 'success');
      } else {
        showToast('Gagal menyimpan pengaturan.', 'error');
      }
    } catch {
      showToast('Terjadi kesalahan jaringan.', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl">
      <AdminCrudHeader title="Pengaturan & Disclaimer" description="Kelola deskripsi platform footer, nilai pajak transaksi global, dan teks disclaimer yang ditampilkan di website." icon={FileText} />

      <div className="bg-card rounded-3xl p-6 border border-border-custom max-w-3xl">

          <form onSubmit={handleSaveSettings} className="space-y-5">
            {/* Site Description Textarea */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-muted block">Deskripsi Platform (Bawah Logo HitungSaham di Footer)</label>
              <textarea
                className="w-full bg-page rounded-xl px-4 py-3 text-main font-semibold outline-none focus:border-acc-blue text-xs"
                rows={3}
                value={siteDescription}
                onChange={(e) => setSiteDescription(e.target.value)}
                placeholder="Platform personal berisi kalkulator simulasi matematis saham serta artikel & blog opini pribadi."
                style={{ resize: 'vertical' }}
              />
            </div>

            {/* Tax Setting Box */}
            <div className="bg-sub-slate p-5 rounded-2xl">
              <h4 className="font-extrabold text-xs text-main tracking-wide mb-2">
                Pengaturan Pajak Transaksi Global
              </h4>
              <p className="text-[11px] text-muted mb-4 leading-relaxed">
                Tarif pajak ini secara latar belakang akan ditambahkan pada simulasi biaya pembelian (buy) dan dikurangkan pada simulasi hasil penjualan (sell) di kalkulator ketiga halaman publik.
              </p>
              <div className="space-y-1 max-w-[200px]">
                <label className="text-[10px] font-bold text-muted block">Tarif Pajak (%)</label>
                <input
                  type="number"
                  step="0.01"
                  className="w-full bg-card rounded-xl px-3 py-2 text-main font-semibold outline-none focus:border-acc-blue"
                  value={taxSetting}
                  onChange={(e) => setTaxSetting(parseFloat(e.target.value) || 0.0)}
                />
              </div>
            </div>

            {/* Terms & Conditions Textarea */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-muted block">Teks Syarat & Ketentuan (Disclaimer Footer)</label>
              <textarea
                className="w-full bg-page rounded-xl px-4 py-3 text-main font-semibold outline-none focus:border-acc-blue text-xs"
                rows={6}
                value={terms}
                onChange={(e) => setTerms(e.target.value)}
                required
                style={{ resize: 'vertical' }}
              />
            </div>

            {/* Share Disclaimer Textarea */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-muted block">Teks Disclaimer Hasil Share Gambar (Watermark)</label>
              <textarea
                className="w-full bg-page rounded-xl px-4 py-3 text-main font-semibold outline-none focus:border-acc-blue text-xs"
                rows={4}
                value={shareDisclaimer}
                onChange={(e) => setShareDisclaimer(e.target.value)}
                required
                style={{ resize: 'vertical' }}
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="flex items-center justify-center gap-1.5 bg-acc-blue hover:bg-acc-blue/90 text-white font-bold py-2.5 px-5 rounded-xl text-xs transition-colors cursor-pointer disabled:opacity-50"
            >
              <Save size={15} />
              <span>{saving ? 'Menyimpan...' : 'Simpan Pengaturan Sistem'}</span>
            </button>
          </form>
      </div>
    </div>
  );
}
